"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

export default function LoginModal({ isOpen, onClose }) {

  // ==========================================
  // State
  // ==========================================

  const [isLoginMode, setIsLoginMode] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Popup Login สำเร็จ
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ==========================================
  // Reset เมื่อเปิด Modal
  // ==========================================

  useEffect(() => {
    if (isOpen) {
      setIsLoginMode(true);

      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");

      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  // ==========================================
  // Popup Login สำเร็จปิดเองใน 3 วินาที
  // ==========================================

  useEffect(() => {
    if (!showSuccessPopup) return;

    const timer = setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  // ==========================================
  // สมัครสมาชิก
  // ==========================================

  const handleRegister = async () => {

    // ตรวจสอบข้อมูล
    if (!firstName.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    if (!lastName.trim()) {
      setError("กรุณากรอกนามสกุล");
      return;
    }

    if (!username.trim()) {
      setError("กรุณากรอก Username");
      return;
    }

    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {

      setLoading(true);
      setError("");

      // ======================================
      // ส่งข้อมูลไป API
      // ======================================

      const response = await fetch(
        "https://api.itdev.cmtc.ac.th/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            firstname: firstName.trim(),
            lastname: lastName.trim(),
            username: username.trim(),
            password: password,
          }),
        }
      );

      // พยายามอ่าน JSON
      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("Register Status:", response.status);
      console.log("Register Response:", data);

      // ======================================
      // API สมัครไม่สำเร็จ
      // ======================================

      if (!response.ok) {

        throw new Error(
          data?.message ||
          data?.error ||
          "ไม่สามารถสมัครสมาชิกได้"
        );
      }

      // ======================================
      // สำรองข้อมูลไว้ในเครื่อง
      // ======================================
      // ใช้สำหรับ Login
      // ไม่ต้องพึ่ง GET /users
      // ======================================

      const oldUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );

      // ตรวจ Username ซ้ำในเครื่อง
      const duplicateUser = oldUsers.find(
        (user) =>
          String(user.username).trim().toLowerCase() ===
          username.trim().toLowerCase()
      );

      if (!duplicateUser) {

        const newUser = {
          id: data?.id || Date.now(),
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          username: username.trim(),
          password: password,
        };

        oldUsers.push(newUser);

        localStorage.setItem(
          "registeredUsers",
          JSON.stringify(oldUsers)
        );
      }

      // ======================================
      // SweetAlert2
      // ใช้แสดงว่าสมัครสำเร็จ
      // ======================================

      await Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        text: "สามารถเข้าสู่ระบบได้เลย",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#111827",
      });

      // ======================================
      // ล้างข้อมูล
      // ======================================

      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");
      setError("");

      // ======================================
      // กลับหน้า Login
      // ======================================

      setIsLoginMode(true);

    } catch (error) {

      console.error("Register Error:", error);

      await Swal.fire({
        icon: "error",
        title: "สมัครสมาชิกไม่สำเร็จ",
        text:
          error?.message ||
          "เกิดข้อผิดพลาดในการเชื่อมต่อ API",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#dc2626",
      });

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // Login
  // ==========================================

  const handleLogin = async () => {

    if (!username.trim()) {
      setError("กรุณากรอก Username");
      return;
    }

    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    try {

      setLoading(true);
      setError("");

      // ======================================
      // ดึง User ที่เคยสมัครไว้ในเครื่อง
      // ======================================

      const users = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );

      console.log("Users ที่เก็บไว้:", users);

      // ======================================
      // ตรวจ Username + Password
      // ======================================

      const user = users.find(
        (item) =>
          String(item.username).trim().toLowerCase() ===
            username.trim().toLowerCase() &&
          String(item.password) === password
      );

      // ======================================
      // Login ไม่ผ่าน
      // ======================================

      if (!user) {

        setError("Username หรือรหัสผ่านไม่ถูกต้อง");

        return;
      }

      // ======================================
      // Login สำเร็จ
      // ======================================

      const currentUser = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
      };

      // เก็บผู้ใช้ที่กำลัง Login
      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );

      console.log("Login สำเร็จ:", currentUser);

      // ======================================
      // ปิด Login Modal
      // แล้วเปิด Popup
      // ======================================

      onClose();

      setShowSuccessPopup(true);

    } catch (error) {

      console.error("Login Error:", error);

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (loading) return;

    // Register
    if (!isLoginMode) {
      await handleRegister();
      return;
    }

    // Login
    await handleLogin();
  };

  // ==========================================
  // ปิด Popup Login สำเร็จ
  // ==========================================

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <>
      {/* =====================================================
          LOGIN / REGISTER MODAL
      ====================================================== */}

      {isOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">

          {/* Modal */}

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200">

            {/* ปุ่มปิด */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />

              </svg>

            </button>

            {/* =================================================
                Logo
            ================================================== */}

            <div className="text-center mb-8 mt-2">

              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">

                <Image
                  src="/image/LOGO.PNG"
                  alt="โลโก้ร้าน"
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />

              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900">

                {isLoginMode
                  ? "ยินดีต้อนรับกลับมา"
                  : "สร้างบัญชีใหม่"}

              </h2>

              <p className="mt-2 text-sm text-gray-500">

                {isLoginMode
                  ? "กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบบัญชีของคุณ"
                  : "เข้าร่วมเป็นส่วนหนึ่งกับเรา เพื่อรับสิทธิพิเศษมากมาย"}

              </p>

            </div>

            {/* =================================================
                Error
            ================================================== */}

            {error && (

              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                {error}

              </div>

            )}

            {/* =================================================
                Form
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ชื่อ / นามสกุล */}

              {!isLoginMode && (

                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ
                    </label>

                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                      placeholder="ชื่อจริง"
                      disabled={loading}
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล
                    </label>

                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) =>
                        setLastName(e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                      placeholder="นามสกุล"
                      disabled={loading}
                    />

                  </div>

                </div>

              )}

              {/* Username */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>

                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="Username"
                  disabled={loading}
                />

              </div>

              {/* Password */}

              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="block text-sm font-medium text-gray-700">
                    รหัสผ่าน
                  </label>

                  {isLoginMode && (

                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      onClick={onClose}
                    >
                      ลืมรหัสผ่าน?
                    </Link>

                  )}

                </div>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  disabled={loading}
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >

                {loading
                  ? "กำลังดำเนินการ..."
                  : isLoginMode
                    ? "เข้าสู่ระบบ"
                    : "สมัครสมาชิก"}

              </button>

            </form>

            {/* Divider */}

            <div className="mt-6 mb-6">

              <div className="relative">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>

                <div className="relative flex justify-center text-sm">

                  <span className="px-4 bg-white text-gray-500">
                    หรือ
                  </span>

                </div>

              </div>

            </div>

            {/* Toggle */}

            <div className="text-center">

              <p className="text-sm text-gray-600">

                {isLoginMode
                  ? "ยังไม่มีบัญชีใช่ไหม? "
                  : "มีบัญชีอยู่แล้วใช่ไหม? "}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {

                    setIsLoginMode(!isLoginMode);

                    setError("");

                    setFirstName("");
                    setLastName("");
                    setUsername("");
                    setPassword("");

                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-indigo-600 after:transition-all hover:after:w-full disabled:text-gray-400"
                >

                  {isLoginMode
                    ? "สมัครสมาชิกเลย"
                    : "เข้าสู่ระบบ"}

                </button>

              </p>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          LOGIN SUCCESS POPUP
      ====================================================== */}

      {showSuccessPopup && (

        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">

          <div className="w-full max-w-sm rounded-3xl bg-white border border-gray-100 p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">

            {/* เครื่องหมายถูก */}

            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white text-4xl font-bold shadow-lg">

                ✓

              </div>

            </div>

            {/* หัวข้อ */}

            <h2 className="text-2xl font-bold text-gray-900">
              เข้าสู่ระบบสำเร็จ
            </h2>

            <p className="mt-2 text-gray-500">
              ยินดีต้อนรับกลับมา 🎉
            </p>

            {/* ปุ่มตกลง */}

            <button
              type="button"
              onClick={closeSuccessPopup}
              className="mt-7 w-full rounded-2xl bg-gray-900 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0"
            >
              ตกลง
            </button>

          </div>

        </div>

      )}

    </>
  );
}
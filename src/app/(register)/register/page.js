"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";

export default function FormRegister() {
  const [form, setForm] = useState({
    txt_firstname: "",
    txt_lastname: "",
    txt_user: "",
    txt_pasword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("ข้อมูลที่จะส่ง:", form);

    // ==========================================
    // ตรวจสอบข้อมูล
    // ==========================================

    if (
      !form.txt_firstname ||
      !form.txt_lastname ||
      !form.txt_user ||
      !form.txt_pasword
    ) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบ",
        confirmButtonText: "ตกลง",
      });

      return;
    }

    if (form.txt_pasword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านสั้นเกินไป",
        text: "กรุณาใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร",
        confirmButtonText: "ตกลง",
      });

      return;
    }

    // ==========================================
    // ส่งข้อมูลไป API
    // ==========================================

    try {
      setLoading(true);

      Swal.fire({
        title: "กำลังสมัครสมาชิก",
        text: "กำลังบันทึกข้อมูล...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://api.itdev.cmtc.ac.th/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            firstname: form.txt_firstname,
            lastname: form.txt_lastname,
            username: form.txt_user,
            password: form.txt_pasword,
          }),
        }
      );

      // ==========================================
      // อ่านข้อมูลจาก API
      // ==========================================

      const data = await response.json();

      console.log("Status:", response.status);
      console.log("API Response:", data);

      Swal.close();

      // ==========================================
      // API Error
      // ==========================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "API ไม่สามารถบันทึกข้อมูลได้"
        );
      }

      // ==========================================
      // สมัครสำเร็จ
      // ==========================================

      await Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        text: "ข้อมูลถูกบันทึกลงระบบเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#2563eb",
      });

      // ==========================================
      // ล้างฟอร์ม
      // ==========================================

      setForm({
        txt_firstname: "",
        txt_lastname: "",
        txt_user: "",
        txt_pasword: "",
      });

    } catch (error) {
      console.error("Register Error:", error);

      Swal.close();

      Swal.fire({
        icon: "error",
        title: "สมัครสมาชิกไม่สำเร็จ",
        text: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ API",
        confirmButtonText: "ตกลง",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="bg-white rounded-lg shadow-md border">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            ฟอร์มสมัครสมาชิก
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >

          {/* ======================================
              Firstname
          ====================================== */}

          <div>
            <label className="block text-black mb-2">
              กรุณาระบุชื่อ
            </label>

            <input
              type="text"
              name="txt_firstname"
              value={form.txt_firstname}
              onChange={handleChange}
              className="w-full border text-black border-black rounded-md px-4 py-2"
              placeholder="firstname"
              disabled={loading}
            />
          </div>

          {/* ======================================
              Lastname
          ====================================== */}

          <div>
            <label className="block text-black mb-2">
              กรุณาระบุนามสกุล
            </label>

            <input
              type="text"
              name="txt_lastname"
              value={form.txt_lastname}
              onChange={handleChange}
              className="w-full border text-black border-black rounded-md px-4 py-2"
              placeholder="lastname"
              disabled={loading}
            />
          </div>

          {/* ======================================
              Username
          ====================================== */}

          <div>
            <label className="block text-black mb-2">
              Username
            </label>

            <input
              type="text"
              name="txt_user"
              value={form.txt_user}
              onChange={handleChange}
              className="w-full border text-black border-black rounded-md px-4 py-2"
              placeholder="username"
              disabled={loading}
            />
          </div>

          {/* ======================================
              Password
          ====================================== */}

          <div>
            <label className="block text-black mb-2">
              Password
            </label>

            <input
              type="password"
              name="txt_pasword"
              value={form.txt_pasword}
              onChange={handleChange}
              className="w-full border text-black border-black rounded-md px-4 py-2"
              placeholder="password"
              disabled={loading}
            />
          </div>

          {/* ======================================
              Submit
          ====================================== */}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "กำลังบันทึก..."
              : "บันทึกข้อมูล"}
          </button>

        </form>
      </div>
    </div>
  );
}
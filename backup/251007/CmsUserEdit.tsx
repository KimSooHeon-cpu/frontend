//! [파일명] CmsUserEdit.tsx
//! [설명] CMS 회원 수정 화면 (책임자 전용, form-urlencoded 완전 일치)
//! [수정일] 2025-10-07

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../src/api/axiosCms";

export default function CmsUserEdit() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  // [1] null → "" 안전 변환 함수
  const safe = (v: any) => (v === null || v === undefined ? "" : String(v).trim());

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    memberId: "",
    memberName: "",
    memberGender: "m",
    memberBirthday: "",
    memberEmailFront: "",
    memberEmailDomain: "naver.com",
    customDomain: "",
    memberMobile: "",
    memberPhone: "",
    zip: "",
    roadAddress: "",
    jibunAddress: "",
    detailAddress: "",
    memberRole: "user",
    adminType: "",
    memberJoindate: "",
    newPw: "",
  });

  // [2] 회원정보 조회
  useEffect(() => {
    if (!memberId) return;

    api
      .get(`/api/cms/members/${memberId}`)
      .then((res) => {
        const data = res.data.data;
        console.log("회원정보 조회 결과:", data);

        let emailFront = "";
        let emailDomain = "naver.com";
        const rawEmail = safe(data.memberEmail);
        if (rawEmail && rawEmail.includes("@")) {
          const [front, domain] = rawEmail.split("@");
          emailFront = front;
          emailDomain = domain;
        }

        setForm({
          memberId: safe(data.memberId),
          memberName: safe(data.memberName),
          memberGender: safe(data.memberGender || "m"),
          memberBirthday: safe(data.memberBirthday),
          memberEmailFront: emailFront,
          memberEmailDomain: emailDomain,
          customDomain: "",
          memberMobile: safe(data.memberMobile),
          memberPhone: safe(data.memberPhone),
          zip: safe(data.zip),
          roadAddress: safe(data.roadAddress),
          jibunAddress: safe(data.jibunAddress),
          detailAddress: safe(data.detailAddress),
          memberRole: safe(data.memberRole || "user"),
          adminType: safe(data.adminType),
          memberJoindate: safe(data.memberJoindate),
          newPw: "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("회원정보 불러오기 실패:", err);
        setLoading(false);
      });
  }, [memberId]);

  // [3] 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // [4] 저장 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    const email =
      form.memberEmailDomain === "custom"
        ? `${form.memberEmailFront}@${form.customDomain}`
        : `${form.memberEmailFront}@${form.memberEmailDomain}`;

    try {
      // ✅ form-urlencoded 파라미터 컨트롤러와 완전 일치
      const params = new URLSearchParams();
      params.append("newPw", safe(form.newPw));
      params.append("memberName", safe(form.memberName));
      params.append("memberGender", safe(form.memberGender));
      params.append("memberBirthday", safe(form.memberBirthday));
      params.append("memberEmail", safe(email));
      params.append("memberMobile", safe(form.memberMobile));
      params.append("memberPhone", safe(form.memberPhone));
      params.append("zip", safe(form.zip));
      params.append("roadAddress", safe(form.roadAddress));
      params.append("jibunAddress", safe(form.jibunAddress));
      params.append("detailAddress", safe(form.detailAddress));
      params.append("memberRole", safe(form.memberRole));
      params.append("adminType", safe(form.adminType));

      console.log("▶ 전송 BODY 확인:", params.toString());

      const res = await api.put(`/api/cms/members/${memberId}`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });

      console.log("▶ 서버 응답:", res.data);

      if (res.data?.success || res.data?.result || res.data?.code === 0) {
        alert("회원정보가 수정되었습니다.");
        navigate("/cms/user");
      } else {
        alert("수정 실패: " + (res.data?.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error("회원정보 수정 오류:", err);
      alert("회원정보 수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <p className="p-8 text-gray-700">로딩 중...</p>;

  // [5] JSX
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">회원정보 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">

        {/* ID, 가입일 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">회원 ID</label>
            <input type="text" value={form.memberId} readOnly className="border rounded w-full px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1 font-medium">가입일</label>
            <input type="text" value={form.memberJoindate} readOnly className="border rounded w-full px-3 py-2 bg-gray-100" />
          </div>
        </div>

        {/* 이름, 성별, 생년월일 (모두 수정 불가) */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">이름</label>
            <input type="text" name="memberName" value={form.memberName} readOnly className="border rounded w-full px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1 font-medium">성별</label>
            <select name="memberGender" value={form.memberGender} disabled className="border rounded w-full px-3 py-2 bg-gray-100">
              <option value="m">남성</option>
              <option value="f">여성</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">생년월일</label>
            <input type="text" name="memberBirthday" value={form.memberBirthday} readOnly className="border rounded w-full px-3 py-2 bg-gray-100" />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label className="block mb-1 font-medium">이메일</label>
          <div className="flex gap-2 items-center">
            <input type="text" name="memberEmailFront" value={form.memberEmailFront} onChange={handleChange} className="border rounded px-3 py-2 w-1/3" />
            <span>@</span>
            <select name="memberEmailDomain" value={form.memberEmailDomain} onChange={handleChange} className="border rounded px-3 py-2 w-1/3">
              <option value="naver.com">naver.com</option>
              <option value="google.com">google.com</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="kakao.com">kakao.com</option>
              <option value="custom">직접입력</option>
            </select>
            {form.memberEmailDomain === "custom" && (
              <input type="text" name="customDomain" value={form.customDomain} onChange={handleChange} className="border rounded px-3 py-2 w-1/3" placeholder="직접입력" />
            )}
          </div>
        </div>

        {/* 연락처 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">휴대폰</label>
            <input type="text" name="memberMobile" value={form.memberMobile} onChange={handleChange} className="border rounded w-full px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">전화번호</label>
            <input type="text" name="memberPhone" value={form.memberPhone} onChange={handleChange} className="border rounded w-full px-3 py-2" />
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block mb-1 font-medium">주소</label>
          <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="우편번호" className="border rounded w-full px-3 py-2 mb-2" />
          <input type="text" name="roadAddress" value={form.roadAddress} onChange={handleChange} placeholder="도로명주소" className="border rounded w-full px-3 py-2 mb-2" />
          <input type="text" name="jibunAddress" value={form.jibunAddress} onChange={handleChange} placeholder="지번주소" className="border rounded w-full px-3 py-2 mb-2" />
          <input type="text" name="detailAddress" value={form.detailAddress} onChange={handleChange} placeholder="상세주소" className="border rounded w-full px-3 py-2" />
        </div>

        {/* 권한 / 관리자유형 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">회원권한</label>
            <select name="memberRole" value={form.memberRole} onChange={handleChange} className="border rounded w-full px-3 py-2">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">관리자유형</label>
            <select name="adminType" value={form.adminType} onChange={handleChange} className="border rounded w-full px-3 py-2">
              <option value="">-- 선택 안함 --</option>
              <option value="책임자">책임자</option>
              <option value="관리자">관리자</option>
              <option value="강사">강사</option>
            </select>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <label className="block mb-1 font-medium">비밀번호 변경</label>
          <input type="password" name="newPw" value={form.newPw} onChange={handleChange} placeholder="변경 시에만 입력" className="border rounded w-full px-3 py-2" />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/cms/user", { replace: true })} // ✅ 절대경로 + replace 옵션
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

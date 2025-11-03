//! [파일명] CmsUserCreate.tsx
//! [설명] CMS 회원 등록 화면 (회원ID 중복확인 + 비밀번호 확인 + 이메일 도메인 선택 + 전체 입력항목 완전형)
//! - 백엔드 연동: CmsMemberController.java → POST /api/cms/members
//! - 역할: 책임자(adminType='책임자')가 CMS에서 신규 회원을 등록하는 화면
//! - 전송형식: application/x-www-form-urlencoded
//! - UI 구조: form 기반 + TailwindCSS 사용

import React, { useState } from "react"; // [1] React 훅 불러오기 (useState: 상태 관리)
import { useNavigate } from "react-router-dom"; // [2] 라우팅용 훅 — 등록 후 목록으로 이동
import api from "../../src/api/axiosCms"; // [3] Axios 인스턴스 — JWT 토큰 자동 첨부됨

export default function CmsUserCreate() {
  const navigate = useNavigate(); // [4] 페이지 이동
  const [loading, setLoading] = useState(false); // [5] 등록 중 로딩 상태
  const [error, setError] = useState<string | null>(null); // [6] 에러 상태 저장

  // ⭐ [7] 입력 폼 상태 정의 (백엔드 CmsMemberController 파라미터와 1:1 대응)
  const [form, setForm] = useState({
    memberId: "",
    memberPw: "",
    memberPwConfirm: "", // 비밀번호 확인용
    memberName: "",
    memberGender: "m",
    memberEmailFront: "",
    memberEmailDomain: "naver.com",
    customDomain: "", // ⭐ 직접입력용 이메일 도메인
    memberMobile: "",
    memberBirthday: "",
    zip: "",
    memberPhone: "",
    roadAddress: "",
    jibunAddress: "",
    detailAddress: "",
    memberRole: "user", // 기본값 user
    adminType: "",
  });

  const [idChecked, setIdChecked] = useState(false); // [8] 회원ID 중복확인 완료 여부

  // [9] 입력값 변경 핸들러 — 입력 필드의 name에 따라 form 상태 업데이트
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ⭐ [10] 회원ID 중복 확인 (GET /api/cms/members/check-id?memberId=xxx)
  // - 백엔드에서 boolean exists 반환
  const handleIdCheck = async () => {
    if (!form.memberId) {
        alert("회원ID를 입력해주세요.");
        return;
    }

    try {
        const res = await api.get(`/api/cms/members/check-id`, {
        params: { memberId: form.memberId },
        });

        const exists = res.data?.data?.exists; // ApiResponse 구조: { success:true, data:{exists:true/false} }
        console.log("ID 중복확인 결과:", exists);

        if (exists) {
        alert("이미 존재하는 회원ID입니다.");
        setIdChecked(false);
        } else {
        alert("사용 가능한 ID입니다.");
        setIdChecked(true);
        }
    } catch (err) {
        console.error("회원ID 중복확인 중 오류:", err);
        alert("ID 중복확인 중 오류가 발생했습니다.");
        setIdChecked(false);
    }
    };

  // [11] 회원 등록 실행 함수
  // - ID 중복확인 필수
  // - 비밀번호 일치 검사
  // - 이메일 조합 후 백엔드 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!idChecked) {
      alert("회원ID 중복확인을 완료해주세요.");
      setLoading(false);
      return;
    }
    if (form.memberPw !== form.memberPwConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      // ⭐ 이메일 결합 (도메인 선택 or 직접입력)
      const fullEmail =
        form.memberEmailDomain === "custom"
          ? `${form.memberEmailFront}@${form.customDomain}`
          : `${form.memberEmailFront}@${form.memberEmailDomain}`;

      // [11-1] URLSearchParams로 전송 데이터 구성 (form-urlencoded)
      const params = new URLSearchParams();
      params.append("memberId", form.memberId);
      params.append("memberPw", form.memberPw);
      params.append("memberName", form.memberName);
      params.append("memberGender", form.memberGender);
      params.append("memberEmail", fullEmail);
      params.append("memberMobile", form.memberMobile);
      params.append("memberBirthday", form.memberBirthday);
      if (form.zip) params.append("zip", form.zip);
      if (form.memberPhone) params.append("memberPhone", form.memberPhone);
      if (form.roadAddress) params.append("roadAddress", form.roadAddress);
      if (form.jibunAddress) params.append("jibunAddress", form.jibunAddress);
      if (form.detailAddress) params.append("detailAddress", form.detailAddress);
      params.append("memberRole", form.memberRole);
      if (form.adminType) params.append("adminType", form.adminType);

      console.log("회원 등록 요청 데이터:", Object.fromEntries(params.entries()));

      await api.post("/api/cms/members", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      alert("회원이 성공적으로 등록되었습니다.");
      navigate("/cms/user");
    } catch (err: any) {
      console.error("회원 등록 실패:", err);
      alert("회원 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [12] 화면 렌더링
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">회원 등록</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        {/* ⭐ [13] 회원ID + 중복확인 */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block font-medium mb-1">회원ID *</label>
            <input
              type="text"
              name="memberId"
              value={form.memberId}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleIdCheck}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            중복확인
          </button>
        </div>

        {/* ⭐ [14] 비밀번호 입력/확인 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">비밀번호 *</label>
            <input
              type="password"
              name="memberPw"
              value={form.memberPw}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">비밀번호 확인 *</label>
            <input
              type="password"
              name="memberPwConfirm"
              value={form.memberPwConfirm}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
        </div>

        {/* ⭐ [15] 이름 / 성별 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">이름 *</label>
            <input
              type="text"
              name="memberName"
              value={form.memberName}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">성별 *</label>
            <select
              name="memberGender"
              value={form.memberGender}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            >
              <option value="m">남성</option>
              <option value="f">여성</option>
            </select>
          </div>
        </div>

        {/* ⭐ [16] 이메일 (앞부분 + 도메인 선택 + 직접입력) */}
        <div>
          <label className="block font-medium mb-1">이메일 *</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="memberEmailFront"
              placeholder="이메일 아이디"
              value={form.memberEmailFront}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-1/3"
              required
            />
            <span>@</span>
            <select
              name="memberEmailDomain"
              value={form.memberEmailDomain}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-1/3"
            >
              <option value="naver.com">naver.com</option>
              <option value="google.com">google.com</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="kakao.com">kakao.com</option>
              <option value="custom">직접입력</option>
            </select>
            {form.memberEmailDomain === "custom" && (
              <input
                type="text"
                name="customDomain"
                placeholder="도메인 입력"
                value={form.customDomain}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-1/3"
              />
            )}
          </div>
        </div>

        {/* ⭐ [17] 연락처 + 생년월일 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">휴대폰 *</label>
            <input
              type="text"
              name="memberMobile"
              value={form.memberMobile}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">생년월일 *</label>
            <input
              type="date"
              name="memberBirthday"
              value={form.memberBirthday}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
        </div>

        {/* ⭐ [18] 주소 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">우편번호</label>
            <input
              type="text"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">전화번호</label>
            <input
              type="text"
              name="memberPhone"
              value={form.memberPhone}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">도로명주소</label>
          <input
            type="text"
            name="roadAddress"
            value={form.roadAddress}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">지번주소</label>
          <input
            type="text"
            name="jibunAddress"
            value={form.jibunAddress}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">상세주소</label>
          <input
            type="text"
            name="detailAddress"
            value={form.detailAddress}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2"
          />
        </div>

        {/* ⭐ [19] 권한 설정 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">회원권한 *</label>
            <select
              name="memberRole"
              value={form.memberRole}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">관리자유형</label>
            <select
              name="adminType"
              value={form.adminType}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            >
              <option value="">-- 선택 안함 --</option>
              <option value="책임자">책임자</option>
              <option value="관리자">관리자</option>
              <option value="강사">강사</option>
            </select>
          </div>
        </div>

        {/* ⭐ [20] 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/cms/user")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}

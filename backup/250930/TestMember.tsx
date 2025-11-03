import React, { useEffect, useState } from "react";
import api from "../../src/api/axiosCms"; //api 불러오기
//import axios from "../api/axios"; // axios로 그냥 불러오기

interface MemberResponse {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  memberRole: string;
  adminType: string | null;
}

export default function TestMember() {
  console.log("TestMember") 
  const [me, setMe] = useState<MemberResponse | null>(null);

  useEffect(() => {

    console.log("member/me의 token값: ", localStorage.getItem("token"));
    
    //api.get<{ data: MemberResponse }>("/members/me") //api로 불러오는 방법인데, 이건 너무 추상적이라서 axios 사용
    // 회원정보 조회를 위한 임시 회원정보 hong2로 설정
    api.get<{ data: MemberResponse }>("/membersTEMP/test", {
            params: {
            memberId: 'hong2',
            memberName: '홍길동2',
            memberEmail: 'hong2@example.com',
            memberMobile: '010-1002-1002',
            memberRole: 'user',
            adminType: null
        }
    })

    // 헤더에다가 밀어오기
    
      .then((res) => {
        console.log("응답:", res.data);
        setMe(res.data.data); // 계정 정보 세팅
      })
      .catch((err) => console.error("API 호출 실패:", err));
  }, []);

  if (!me) return <p>정보를 불러오는 중...</p>;


  return (
    <div>
      <h2>계정 정보</h2>
      <ul>
        <li>회원ID: {me.memberId}</li>
        <li>이름: {me.memberName}</li>
        <li>이메일: {me.memberEmail}</li>
        <li>휴대폰: {me.memberMobile}</li>
        <li>권한: {me.memberRole}</li>
        <li>관리자유형: {me.adminType}</li>
      </ul>
    </div>
  );
}

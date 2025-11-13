//! [파일명] CmsContentDetail.tsx
//! [설명] CMS 관리자용 콘텐츠 단건 상세 조회 화면 (상세정보 + 첨부파일 표시 + 목록/삭제/수정)
//! [작성일] [251011]
//! [연동 API]
//!   - GET /api/cms/contents/{contentId} : 상세조회
//!   - DELETE /api/cms/contents/{contentId} : 삭제
//!   - PUT /api/cms/contents/{contentId} : 수정 이동 시 사용
//! [호출 위치] CmsApp.tsx → <Route path="contents/:contentId" element={<CmsContentDetail />} />

import { useEffect, useState } from "react"; // React 훅 불러오기
import { useParams, useNavigate } from "react-router-dom"; // URL 파라미터(contentId)와 네비게이터 훅 불러오기
import api from "../../../api/axiosCms"; // CMS 전용 Axios 인스턴스 불러오기
import "../../../css/all/form.css";

// 💾 첨부파일 응답 DTO 선언
interface FileResponse { 
fileId: number; // 파일 PK
fileOriginalName: string; // 원본 파일명
filePath: string; // 파일 접근 경로(/images/...)
} 

interface ContentResponse { // 콘텐츠 응답 DTO 정의 시작
contentId: number; // 콘텐츠 PK
contentTitle: string; // 콘텐츠 제목
contentContent: string; // 콘텐츠 내용 (HTML 포함)
contentType: string; // 콘텐츠 구분(1depth)
contentUse: string; // 사용여부(Y/N)
contentNum: number; // 정렬번호(2depth)
memberId: string; // 작성자 ID
regDate: string; // 등록일
modDate: string; // 수정일
contentFilePath : string ;// 콘텐츠 첨부 파일 경로 [251113] 추가
} // 콘텐츠 응답 DTO 정의 끝

export default function CmsContentDetail() { // 메인 컴포넌트 시작
const { contentId } = useParams<{ contentId: string }>(); // URL 경로에서 contentId 파라미터 추출
const navigate = useNavigate(); // 페이지 이동용 네비게이터 훅 선언

const [content, setContent] = useState<ContentResponse | null>(null); // 콘텐츠 데이터를 저장할 상태 변수
const [files, setFiles] = useState<FileResponse[]>([]); // 첨부파일 목록 상태 변수
const [loading, setLoading] = useState(true); // 로딩 여부 상태 변수

useEffect(() => { // 컴포넌트가 처음 렌더링될 때 또는 contentId가 바뀔 때 실행
const fetchDetail = async () => { // 상세 조회 데이터를 불러올 비동기 함수 선언
console.log("콘텐츠 정보 불러오기 URL: ", `/api/cms/contents/${contentId}`)
try { // 예외 처리 시작
    const res = await api.get(`/api/cms/contents/${contentId}`); // API 호출: 콘텐츠 상세 조회
    const data = res.data.data; // API 응답에서 data 속성 추출
    setContent(data.content); // 콘텐츠 정보 상태에 저장
    setFiles(data.files || []); //💾  첨부파일 목록 상태에 저장
} catch (err) { // 예외 발생 시
    console.error("콘텐츠 상세조회 실패:", err); // 콘솔에 오류 출력
} finally { // try-catch 종료 후 항상 실행
    setLoading(false); // 로딩 상태 false로 변경
}
}; // 비동기 함수 선언 끝
fetchDetail(); // 상세 조회 함수 실행
}, [contentId]); // contentId가 변경될 때마다 재실행

const handleList = () => navigate("/cms/contents"); // 목록 버튼 클릭 시 콘텐츠 목록 화면으로 이동
const handleEdit = () => navigate(`/cms/contents/form?contentId=${contentId}`); // 수정 버튼 클릭 시 수정 화면으로 이동
const handleDelete = async () => { // 삭제 버튼 클릭 시 실행되는 함수
if (!window.confirm("정말 삭제하시겠습니까?")) return; // 삭제 확인창 표시
try { // 예외 처리 시작
    const res = await api.delete(`/api/cms/contents/${contentId}`); // DELETE API 호출
    if (res.data.code === 0) { // 성공 코드 0이면
        alert("삭제되었습니다."); // 사용자에게 알림
        navigate("/cms/contents"); // 목록 화면으로 이동
    } else { // 실패 코드면
        alert(res.data.message || "삭제 실패"); // 오류 메시지 표시
    }
} catch (err) { // 요청 예외 발생 시
    console.error("삭제 실패:", err); // 콘솔에 오류 로그
    alert("서버 오류로 삭제에 실패했습니다."); // 사용자에게 실패 알림
}
}; // handleDelete 함수 끝

if (loading) return <div className="p-6 text-center">불러오는 중...</div>; // 로딩 중일 때 표시되는 화면
if (!content) return <div className="p-6 text-center text-red-500">콘텐츠를 찾을 수 없습니다.</div>; // 콘텐츠가 없을 때 표시

return ( // 화면 렌더링 시작
<div className="p-8 bg-white rounded shadow-md"> {/* 페이지 전체 컨테이너 */}
<h2 className="text-2xl font-bold mb-6 border-b pb-2">콘텐츠 상세</h2> {/* 페이지 제목 */}

{/* // !--------------------------------- 상위 메뉴 및 제목 표시 영역 --------------------------------- */}
<div className="mb-6"> 
<p className="text-gray-600 mb-1">상위 메뉴 : {content.contentType}</p> {/* 상위 메뉴 표시 */}
<p className="text-gray-600">정렬 번호 : {content.contentNum}</p> {/* 상위 메뉴의 정렬번호 표시 */}
<p className="text-gray-600">제목 : {content.contentTitle}</p> {/* 콘텐츠 제목 표시 */}
</div>      
{/* // !--------------------------------- 상위 메뉴 및 제목 표시 영역 --------------------------------- */}

{/* // ?-------------------------------------- 본문(내용) 영역 -------------------------------------- */}
<div 
  className="border p-4 rounded mb-6 min-h-[200px]"
  // 💡 HTML 문자열을 태그로 해석하여 렌더링
  dangerouslySetInnerHTML={{ __html: content.contentContent }} 
/>
{/* // ?-------------------------------------- 본문(내용) 영역 -------------------------------------- */}

{/* // *--------------------------------------💾 첨부파일 영역 (최종 수정됨) --------------------------------------*/}
<div className="mb-6"> 
<p className="font-semibold mb-1">첨부파일</p> {/* 첨부파일 제목 */}

{/* 💡 contentFilePath가 있으면 파일명과 링크를 하나의 목록 항목으로 표시 */}
{content.contentFilePath ? (
  <div className="mb-2">
    {/* 단일 파일 링크를 단순 텍스트/링크 블록으로 표시 */}
    <a
      href={`http://16.176.33.172:8181/${content.contentFilePath}`}
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 hover:underline" 
    >
      {content.contentFilePath} 
    </a>
  </div>
) : null}

{/* 💡 files 배열이 있으면 다중 파일 목록을 표시 */}
{files.length > 0 && (
  <ul className="list-disc list-inside mt-2">
    {files.map((f) => ( // 파일 배열 반복 렌더링
      <li key={f.fileId}> {/* 파일 리스트 항목 */}
        <a
          href={`http://16.176.33.172:8181${f.filePath}`} 
          target="_blank" // 새 탭에서 열기
          rel="noopener noreferrer" // 보안 속성
          className="text-blue-600 hover:underline" // 링크 스타일
        >
          {f.fileOriginalName} {/* 원본 파일명 표시 */}
        </a>
      </li>
    ))}
  </ul>
)}

{/* 첨부파일이 contentFilePath에도 files 배열에도 없을 때만 "첨부파일이 없습니다" 표시 */}
{!(content.contentFilePath || files.length > 0) && (
    <p className="text-gray-500">첨부파일이 없습니다.</p>
)}
</div>
{/* // *--------------------------------------💾 첨부파일 영역 --------------------------------------*/}

{/* // ^--------------------------------------- 사용여부 영역 ---------------------------------------*/}
<div className="mb-6"> {/* 사용여부 영역 */}
<p className="font-semibold mb-1">사용여부</p> {/* 섹션 제목 */}
<p>{content.contentUse === "Y" ? "가능" : "불가"}</p> {/* 사용여부 표시 */}
</div>
{/* // ^--------------------------------------- 사용여부 영역 ---------------------------------------*/}

{/* // &---------------------------------------- 버튼 영역 -----------------------------------------*/}
<div className="flex justify-end gap-3 mt-8">
<button onClick={handleList} className="button-secondary">목록</button>
<button onClick={handleDelete} className="button-danger">삭제</button>
<button onClick={handleEdit} className="button-primary">수정</button>
</div>
{/* // &---------------------------------------- 버튼 영역 -----------------------------------------*/}
</div>
); // 화면 렌더링 끝
} // CmsContentDetail 컴포넌트 끝

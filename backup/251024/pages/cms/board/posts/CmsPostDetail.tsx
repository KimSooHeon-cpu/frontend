// [파일명] CmsPostDetail.tsx
// [설명] CMS 게시판별 게시글 상세 조회 (본문 + 첨부파일 다운로드 + 댓글 목록)
// [작성일] [251019-댓글및첨부다운로드완성]
// [데이터 연동 흐름]
// 1. React useEffect → axiosCms.get("/api/cms/boards/{boardId}/posts/{postId}") 호출
// 2. Controller: CmsPostController.getPostDetail()
// 3. Service: PostService.getPostDetail()
// 4. Mapper: postMapper.selectPostDetail()
// 5. Oracle: SELECT post_file_path, post_content 포함
// 6. React useEffect → axiosCms.get("/api/cms/boards/{boardId}/posts/{postId}/comments")
// 7. Controller: CmsCommentController.listComments()
// 8. Service: CommentService.getCommentsByPost()
// 9. Mapper: commentMapper.selectCommentsByPost()
// 10. Oracle: SELECT * FROM comment_tbl WHERE post_id = ? ORDER BY comment_reg_date DESC
// 11. 응답(post + comments) → React 상태(post, comments)에 저장 후 화면 렌더링

import React, { useEffect, useState } from "react"; // React 라이브러리 및 기본 훅 import
import { useNavigate, useParams } from "react-router-dom"; // 페이지 이동 및 URL 파라미터 사용을 위한 훅 import
// import api from "../../../../api/axiosCms"; // 
import api from "../../../../api/axiosCms"; // CMS 전용 API 요청을 위한 axios 인스턴스 (관리자 토큰 포함)
import apiComent from "../../../../api/axios";   // [251020] -댓글- 사용자용 API 요청을 위한 axios 인스턴스

// 게시글 상세 정보의 데이터 구조를 정의하는 타입
type PostDetail = {
  postId: number;          // 게시글 고유 ID
  boardId: number;         // 소속된 게시판 ID
  postTitle: string;       // 게시글 제목
  postContent: string;     // 게시글 내용 (HTML 형식)
  memberId?: string;       // 작성자 ID (선택적)
  memberName?: string;     // 작성자 이름 (선택적)
  postRegDate?: string;    // 등록일 (선택적)
  postViewCount?: number;  // 조회수 (선택적)
  postFilePath?: string;   // 첨부파일 경로 (선택적)
};

// 댓글 정보의 데이터 구조를 정의하는 타입
type Comment = {
  commentsId: number;      // 댓글 고유 ID
  postId: number;          // 댓글이 달린 게시글 ID
  memberId: string;        // 댓글 작성자 ID
  memberName?: string;     // 댓글 작성자 이름 (선택적)
  content: string;         // 댓글 내용
  createdAt: string;       // 댓글 생성일
  updatedAt?: string;      // 댓글 수정일 (선택적)
};

// CmsPostDetail 컴포넌트 정의
const CmsPostDetail: React.FC = () => {
  const navigate = useNavigate(); // 페이지 이동 함수를 사용하기 위한 훅
  const { boardId, postId } = useParams<{ boardId: string; postId: string }>(); // URL 파라미터에서 boardId와 postId를 추출

  // 컴포넌트의 상태를 관리하는 useState 훅
  const [post, setPost] = useState<PostDetail | null>(null); // 게시글 상세 정보를 저장할 상태
  const [comments, setComments] = useState<Comment[]>([]); // [251020] -댓글- 댓글 목록을 저장할 상태
  const [loading, setLoading] = useState(false); // 데이터 로딩 중인지 여부를 나타내는 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지를 저장할 상태

  // [1] 게시글 상세 정보를 서버에서 가져오는 함수
  const fetchPostDetail = async () => {
    if (!boardId || !postId) return; // boardId나 postId가 없으면 함수 실행 중단
    setLoading(true); // 로딩 상태 시작
    setError(null); // 이전 에러 메시지 초기화
    try {
      // API를 통해 게시글 상세 정보 요청
      const res = await api.get(`/api/cms/boards/${boardId}/posts/${postId}`);
      console.log("[DEBUG] 게시글 상세 응답 =", res.data); // 디버깅을 위한 응답 데이터 출력
      setPost(res.data); // 응답받은 데이터를 post 상태에 저장
    } catch (err) {
      console.error("⚠️ 게시글 상세 조회 실패:", err); // 에러 발생 시 콘솔에 로그 출력
      setError("게시글을 불러오는 중 오류가 발생했습니다."); // 사용자에게 보여줄 에러 메시지 설정
    } finally {
      setLoading(false); // 요청 완료 후 로딩 상태 종료
    }
  };

  //? ----------------------------------------------- 댓글 기능 -----------------------------------------------
  // [2] [251020] -댓글- 해당 게시글의 댓글 목록을 서버에서 가져오는 함수
  const fetchComments = async () => {
    if (!postId) return; // postId가 없으면 함수 실행 중단
    try {
      // 사용자용 API를 통해 댓글 목록 요청
      //const res = await apiComent.get(`/api/posts/${postId}/comments`); // ✅ 사용자용 axios 사용
      const res = await apiComent.get(`/api/boards/${boardId}/posts/${postId}/comments`);
      console.log("[DEBUG] 댓글 목록 응답 =", res.data); // 디버깅을 위한 응답 데이터 출력
      
      // 백엔드 응답 데이터 구조가 다양할 경우를 대비한 처리
      const list = Array.isArray(res.data)
        ? res.data // 응답 데이터가 배열이면 그대로 사용
        : Array.isArray(res.data.data)
          ? res.data.data // 응답 데이터가 객체이고 그 안의 data 속성이 배열이면 사용
          : []; // 두 경우 모두 아니면 빈 배열로 초기화
      setComments(list); // 가져온 댓글 목록을 comments 상태에 저장
    } catch (err) {
      console.error("댓글 목록 불러오기 실패:", err); // 에러 발생 시 콘솔에 로그 출력
    }
  };

  // [251020-2] 특정 댓글을 삭제하는 함수
  const deleteComment = async (commentsId: number) => {
    // 사용자에게 정말 삭제할 것인지 확인
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      // CMS 관리자 전용 API를 통해 댓글 삭제 요청
      //const res = await api.delete(`/api/posts/${postId}/comments/${commentsId}`);
      const res = await api.delete(`/api/boards/${boardId}/posts/${postId}/comments/${commentsId}`);
      console.log("[DEBUG] 댓글 삭제 응답 =", res.data); // 디버깅을 위한 응답 데이터 출력
      
      fetchComments(); // 댓글 삭제 후, 목록을 새로고침하여 화면에 반영
      
    } catch (err) {
      console.error("⚠️ 댓글 삭제 실패:", err); // 에러 발생 시 콘솔에 로그 출력
      alert("댓글 삭제 중 오류가 발생했습니다."); // 사용자에게 에러 알림
    }
  };
  //? ----------------------------------------------- 댓글 기능 -----------------------------------------------


  // [3] 첨부파일 다운로드 링크를 처리하는 함수
  const handleDownload = (filePath: string) => {
    try {
      console.log("📂 [DEBUG] 원본 filePath =", filePath); // 원본 파일 경로 디버깅

      // ✅ 1) 경로 앞부분에 있을 수 있는 "posts/" 문자열 제거
      const cleanPath = filePath.replace(/^(\/)?posts\//, "");
      // ✅ 2) 경로가 "/"로 시작하지 않으면 앞에 붙여줌 (일관성 유지)
      const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      // ✅ 3) 백엔드 서버 주소와 조합하여 완전한 다운로드 URL 생성
      const downloadUrl = `http://localhost:8181${normalized}`;
      console.log("📎 [DEBUG] 최종 다운로드 URL =", downloadUrl); // 최종 URL 디버깅
      // ✅ 4) 새 탭에서 다운로드 URL을 열어 파일 다운로드 실행
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("⚠️ [ERROR] 첨부파일 다운로드 실패:", err); // 에러 발생 시 콘솔에 로그 출력
    }
  };

  // [4] 컴포넌트가 처음 렌더링될 때 실행되는 useEffect 훅
  useEffect(() => {
    fetchPostDetail(); // 게시글 상세 정보 가져오기
    fetchComments(); // 댓글 목록 가져오기
  }, [boardId, postId]); // boardId나 postId가 변경되면 다시 실행

  // [5] 로딩 및 에러 상태에 따른 UI 처리
  if (loading)
    return <p style={{ textAlign: "center", padding: 20 }}>불러오는 중...</p>; // 로딩 중일 때 표시
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", padding: 20 }}>{error}</p> // 에러 발생 시 표시
    );
  if (!post)
    return <p style={{ textAlign: "center", padding: 20 }}>게시글이 없습니다.</p>; // 게시글 데이터가 없을 때 표시

  // [6] 본문 렌더링
  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* 게시글 제목 */}
      <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {post.postTitle}
      </h2>
      {/* 작성자, 등록일, 조회수 정보 */}
      <div
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}
      >
        <div style={{ color: "#555" }}>작성자: {post.memberName || post.memberId}</div>
        <div style={{ color: "#777" }}>
          등록일: {post.postRegDate?.slice(0, 10) || "-"} / 조회수:{" "}
          {post.postViewCount ?? 0}
        </div>
      </div>

      {/* 첨부파일이 있을 경우 다운로드 버튼 표시 */}
      {post.postFilePath && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => handleDownload(post.postFilePath!)}
            style={{
              background: "none",
              color: "#4caf50",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            첨부파일 다운로드
          </button>
        </div>
      )}

      {/* 게시글 본문 (HTML을 직접 렌더링) */}
      <div
        style={{
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          padding: "20px 0",
          color: "#333",
          minHeight: 200,
        }}
        dangerouslySetInnerHTML={{ __html: post.postContent || "" }}
      ></div>

      {/* ------------------ [251020] -댓글- 목록 ------------------- */}
      {/* 댓글 목록 섹션 */}
      <div style={{ marginTop: 40 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: "bold",
            borderBottom: "2px solid #ddd",
            paddingBottom: 8,
          }}
        >
          댓글 ({comments.length})
        </h3>

        {/* 댓글 목록이 있으면 map으로 반복하여 출력, 없으면 안내 메시지 표시 */}
        {comments && comments.length > 0 ? (
          <ul>
            {comments.map((c) => (
              <li
                key={c.commentsId}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {/* 댓글 내용 */}
                <div>
                  <div style={{ fontWeight: "bold" }}>{c.memberName || c.memberId}</div>
                  <div style={{ color: "#333", margin: "4px 0" }}>{c.content}</div>
                  <div style={{ color: "#999", fontSize: 12 }}>
                    {c.createdAt?.slice(0, 16)}
                  </div>
                </div>

                {/* [251020-2] 댓글 삭제 버튼 */}
                <button
                  onClick={() => deleteComment(c.commentsId)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: 3,
                    padding: "4px 10px",
                    cursor: "pointer",
                    height: 30,
                    alignSelf: "center",
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666", marginTop: 10 }}>등록된 댓글이 없습니다.</p>
        )}
      </div>
      {/* ------------------ [251020] -댓글- 목록 ------------------- */}

      {/* 하단 버튼 영역 (수정, 목록으로) */}
      <div style={{ marginTop: 30, textAlign: "right" }}>
        {/* 수정 페이지로 이동하는 버튼 */}
        <button
          onClick={() => navigate(`/cms/boards/${boardId}/posts/${postId}/edit`)}
          style={{
            background: "#666",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            padding: "6px 16px",
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          수정
        </button>
        {/* 목록 페이지로 돌아가는 버튼 */}
        <button
          onClick={() => navigate(`/cms/boards/${boardId}/posts`)}
          style={{
            background: "#aaa",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            padding: "6px 16px",
            cursor: "pointer",
          }}
        >
          목록으로
        </button>
      </div>
    </div>
  );
};

export default CmsPostDetail; // 컴포넌트를 다른 파일에서 사용할 수 있도록 export

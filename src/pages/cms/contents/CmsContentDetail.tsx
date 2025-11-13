//! [파일명] CmsContentDetail.tsx
//! [설명] CMS용 콘텐츠 상세 조회 화면
//! [작성일] 25-10-13
//! [수정일] 25-11-13 (사용자 화면과 UI 통일, 첨부파일 기능 추가)
//! [연동 API]
//!   - GET /api/cms/contents/{contentId} : 상세조회
//!   - DELETE /api/cms/contents/{contentId} : 삭제
//! [호출 위치] CmsContentList.tsx → /cms/contents/detail/{contentId}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { Box, Button, Typography, Paper } from "@mui/material";
import { toast } from "react-toastify";

// [3] 콘텐츠 데이터 타입 정의
interface ContentDetail {
  contentId: number; // 콘텐츠 PK
  contentTitle: string; // 콘텐츠 제목
  contentContent: string; // 콘텐츠 내용
  contentType: string; // 콘텐츠 구분(1depth)
  contentUse: string; // 사용여부(Y/N)
  contentNum: number; // 정렬번호(2depth)
  contentRegDate: string;
  contentModDate: string;
  contentFilePath?: string; // [251113] 첨부파일 다운로드
}

const CmsContentDetail: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>(); // URL 경로에서 contentId 파라미터 추출
  const navigate = useNavigate(); // 페이지 이동용 네비게이터 훅 선언

  const [content, setContent] = useState<ContentDetail | null>(null); // 콘텐츠 데이터를 저장할 상태 변수
  const [loading, setLoading] = useState(true); // 로딩 여부 상태 변수
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { // 컴포넌트가 처음 렌더링될 때 또는 contentId가 바뀔 때 실행
    const fetchDetail = async () => { // 상세 조회 데이터를 불러올 비동기 함수 선언
      try { // 예외 처리 시작
        setLoading(true);
        const res = await api.get(`/api/cms/contents/${contentId}`); // API 호출: 콘텐츠 상세 조회
        setContent(res.data.data);
      } catch (err) { // 예외 발생 시
        console.error("콘텐츠 상세조회 실패:", err); // 콘솔에 오류 출력
        toast.error("콘텐츠를 불러오는 데 실패했습니다.");
        setError("콘텐츠를 불러오지 못했습니다.");
      } finally { // try-catch 종료 후 항상 실행
        setLoading(false); // 로딩 상태 false로 변경
      }
    }; // 비동기 함수 선언 끝
    fetchDetail(); // 상세 조회 함수 실행
  }, [contentId]); // contentId가 변경될 때마다 재실행

  const handleDelete = async () => { // 삭제 버튼 클릭 시 실행되는 함수
    if (window.confirm(`'${content?.contentTitle}' 콘텐츠를 정말로 삭제하시겠습니까?`)) {
    try { // 예외 처리 시작
      await api.delete(`/api/cms/contents/${contentId}`);
      toast.success("콘텐츠가 성공적으로 삭제되었습니다.");
      navigate("/cms/contents");
    } catch (err) { // 요청 예외 발생 시
      console.error("삭제 실패:", err); // 콘솔에 오류 로그
      toast.error("콘텐츠 삭제에 실패했습니다.");
    }
    }
  }; // handleDelete 함수 끝

  if (loading) return <p className="text-center mt-10 text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!content) return <p className="text-center mt-10 text-gray-400">콘텐츠가 존재하지 않습니다.</p>;

  return ( // 화면 렌더링 시작
    <Box sx={{ p: 3, maxWidth: 900, margin: "48px auto" }}>
      {/* 게시글 본문 영역 */}
      <Typography variant="h5" fontWeight="bold" mb={1} color="text.primary" sx={{ letterSpacing: -1 }}>
        {content.contentTitle}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        등록일: {content.contentRegDate?.split("T")[0] || "-"}
      </Typography>

      <Paper
        elevation={2}
        sx={{
          lineHeight: 1.7,
          p: 2,
          borderRadius: 1,
          mb: 3,
          border: "1px solid #aeadadff",
          boxShadow: "none",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: content.contentContent }}
          style={{
            minHeight: 80,
            overflow: 'hidden'
          }}
        />
      </Paper>

      {/*// [251113] 첨부파일 다운로드*/}
      {content.contentFilePath && (
        <Box sx={{ mb: 3, mt: -2 }}>
          <Typography component="span" fontWeight="bold" mr={1}>
            첨부파일:{" "}
          </Typography>
          <Button
            variant="text"
            color="primary"
            href={`http://16.176.33.172:8181${content.contentFilePath}`}
            target="_blank"
            sx={{ fontWeight: 600, textDecoration: "underline", px: 0.5, minWidth: 0 }}
          >
            {content.contentFilePath.split("/").pop()}
          </Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mb: 2 }}>
        최종 수정일: {content.contentModDate?.split("T")[0] || "-"}
      </Typography>

      {/* [9] 액션 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate("/cms/contents")}>
          목록
        </Button>
        <Box>
          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => navigate(`/cms/contents/edit/${contentId}`)}>
            수정
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            삭제
          </Button>
        </Box>
      </Box>
    </Box>
  ); // 화면 렌더링 끝
};

export default CmsContentDetail;

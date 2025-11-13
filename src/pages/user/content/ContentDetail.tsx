//! [파일명] ContentDetail.tsx
//! [설명] 사용자용 콘텐츠 상세 조회 화면 (이용안내 / 상품·시설안내 등) - 게시글 규격(max-w-3xl)에 맞춰 넓이 및 스타일 조정 완료
//! [설명] 사용자용 콘텐츠 상세 조회 화면 (이용안내 / 상품·시설안내 등) - UserPostDetail.tsx 스타일과 동일하게 MUI로 변경
//! [작성일] [251012 최종본]
//! [연동 API] GET /api/contents/{contentType}/{contentNum}
//! [호출 위치] Navbar.tsx → /contents/:contentType/:contentNum

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";

// MUI 컴포넌트 import
import {
  //Box, Paper, Typography,
  Box, Paper, Typography, Button, //* [251113] 첨부파일 다운로드 버튼(Button) 추가
} from "@mui/material";


// [3] 콘텐츠 데이터 타입 정의 (백엔드 ContentResponse 기준)
interface ContentDetail {
  contentId: number;
  contentTitle: string;
  contentContent: string; // ⚠️ 백엔드 필드명과 일치
  contentType: string;
  contentNum: number;
  contentUse: string;
  contentRegDate: string;
  contentModDate: string;
  contentFilePath?: string; //* [251113] 첨부파일 다운로드
}

// [4] 컴포넌트 정의 시작
const ContentDetail: React.FC = () => {
  // [4-1] URL에서 파라미터 추출 (예: /contents/이용안내/1)
  const { contentType, contentNum } = useParams<{ contentType: string; contentNum: string }>();

  // [4-2] 상태값 정의
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // [5] 콘텐츠 데이터 로딩 함수
  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/contents/${contentType}/${contentNum}`);
      const fetchedContent = res.data.data?.content;
      setContent(fetchedContent);
    } catch (err) {
      console.error("[ContentDetail] 콘텐츠 조회 실패:", err);
      setError("콘텐츠를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [6] 컴포넌트 마운트 시 실행
  useEffect(() => {
    fetchContent();
  }, [contentType, contentNum]);

  // [7] 로딩 / 오류 / 데이터 없음 처리
  if (loading) return <p className="text-center mt-10 text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!content) return <p className="text-center mt-10 text-gray-400">콘텐츠가 존재하지 않습니다.</p>;

  // [8] 본문 렌더링
  return (
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
          // [수정] 이 속성 제거: HTML 요소의 width 충돌 방지
          // whiteSpace: "pre-wrap", 
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
            // [추가] 부모 컨테이너(Paper)를 넘지 않도록 강제 설정
            overflow: 'hidden'
          }}
        />
      </Paper>

      {/* //* --------------------------- [251113] 첨부파일 다운로드 -----------------------------------*/}
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
      {/* //* --------------------------- [251113] 첨부파일 다운로드 -----------------------------------*/}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
        최종 수정일: {content.contentModDate?.split("T")[0] || "-"}
      </Typography>
    </Box>
  );
};

export default ContentDetail;

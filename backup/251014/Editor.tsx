//! [파일명] Editor.tsx
//! [설명] Summernote 제거 후 복구용 간단 텍스트 에디터
//! [작성일] [251013 복구 버전]

// import React from "react";

// interface EditorProps {
//   value: string;
//   onChange: (content: string) => void;
// }

// export default function Editor({ value, onChange }: EditorProps) {
//   return (
//     <textarea
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder="내용을 입력하세요..."
//       className="w-full h-64 border rounded p-2"
//     />
//   );
// }




// [파일명] Editor.tsx
// [설명] CMS 콘텐츠 및 게시글에서 공통으로 사용하는 리치 에디터 컴포넌트
// [작성일] [251014]
// [특징]
//   - react-draft-wysiwyg 기반
//   - 이미지 업로드 기능 포함 (FileController.uploadEditorImage 연동)
//   - 상위 컴포넌트로 HTML 반환(onChange)
//   - 콘텐츠 수정 시 기본값(defaultValue) 주입 가능

import React, { useState, useEffect } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import apiCms from "../../../api/axiosCms"; // CMS 전용 Axios 인스턴스
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface EditorProps {
  onChange?: (html: string) => void; // HTML 본문을 상위 컴포넌트에 전달
  defaultValue?: string; // 기존 HTML 본문 (수정 시)
}

const EditorComponent: React.FC<EditorProps> = ({ onChange, defaultValue }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // [1] 수정모드(defaultValue 존재)일 경우 HTML → Draft 변환
  useEffect(() => {
    if (defaultValue) {
      const blocksFromHtml = htmlToDraft(defaultValue);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [defaultValue]);

  // [2] 상태 변경 시 HTML 변환 후 콜백 호출
  const onEditorStateChange = (state: EditorState) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    if (onChange) onChange(html); // 상위 폼으로 HTML 반환
  };

  // [3] 이미지 업로드 콜백 (FileController.uploadEditorImage 연동)
  const uploadImageCallBack = async (file: File) => {
    console.log('uploadImageCallBack');
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await apiCms.post("/api/files/upload/editor", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // FileController 응답 구조: { data: { link: "http://localhost:8181/images/editor/uuid.jpg" } }
      const link = response.data?.data?.link;
      console.log("🖼️ 이미지 업로드 성공:", link);

      return Promise.resolve({ data: { link } });
    } catch (err) {
      console.error("❌ 이미지 업로드 실패:", err);
      return Promise.reject(err);
    }
  };

  // [4] 에디터 UI 구성
  return (
    <div className="bg-white border rounded p-3">
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor min-h-[250px] bg-gray-50 p-2 rounded"
        localization={{ locale: "ko" }}
        toolbar={{
          options: [
            "inline",
            "blockType",
            "fontSize",
            "list",
            "textAlign",
            "colorPicker",
            "link",
            "image",
            "history",
          ],
          image: {
            uploadEnabled: true,
            uploadCallback: uploadImageCallBack,

            previewImage: true,
            alt: { present: false, mandatory: false },
            inputAccept: "image/gif,image/jpeg,image/jpg,image/png,image/svg",
          },
        }}
      />
    </div>
  );
};

export default EditorComponent;

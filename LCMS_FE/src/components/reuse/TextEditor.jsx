import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const TextEditor = ({ value, funct, editorWidth = "100%" }) => {
  const editorRef = useRef(null);

  const log = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      funct(content);
    }
  };

  return (
    <>
      <Editor
        apiKey="nzkixghjgoitf5a3z4rcnl8f5rvsvfjajbek4ccgkflhnjru"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        onChange={log}
        initialValue={value}
        init={{
          height: 300,
          width: editorWidth,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
            "emoticons",
            "paste",
            "textcolor",
            "directionality",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | link image table | emoticons | fullscreen | code | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #333 }",
          paste_data_images: true,
          image_advtab: true,
          link_assume_external_targets: true,
          toolbar_mode: "sliding",
          zindex: 9999,
        }}
      />
    </>
  );
};

export default TextEditor;

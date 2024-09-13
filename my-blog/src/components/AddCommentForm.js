import { useState } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";

const AddCommentForm = ({ articleId, onArticleUpdated }) => {
  const [commentText, setCommentText] = useState("");
  const { user } = useUser();
  const addComment = async () => {
    console.log("post userDetails", user);
    const token = user && (await user.getIdToken());
    const headers = token ? { authtoken: token } : {};
    console.log("header", headers);
    const response = await axios.post(
      `/api/articles/${articleId}/comments`,
      {
        text: commentText,
      },
      headers
    );
    const updatedArticle = response.data;
    onArticleUpdated(updatedArticle);
    setCommentText("");
  };

  return (
    <div id="add-comment-form">
      <h3>Add a comment</h3>
      {user && <p>You are posting as: {user.email}</p>}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows="4"
        cols="50"
      />

      <button onClick={addComment}>Add Comment</button>
    </div>
  );
};

export default AddCommentForm;

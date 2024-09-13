import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import articles from "./article-content";
import NotFoundPage from "./NotFoundPage";
import CommentsList from "../components/CommentsList";
import AddCommentForm from "../components/AddCommentForm";
import useUser from "../hooks/useUser";

const ArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({
    upvote: 0,
    comments: [],
    canUpvote: false,
  });
  const { canUpvote } = articleInfo;
  const { articleId } = useParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    const loadArticleInfo = async () => {
      console.log("get userDetails", user);
      const token = user && (await user.getIdToken());
      const headers = token ? { authtoken: token } : {};
      const response = await axios.get(`/api/articles/${articleId}`, {
        headers,
      });
      const newArticleInfo = response.data;
      setArticleInfo(newArticleInfo);
    };
    if (!isLoading) {
      loadArticleInfo();
    }
  }, [isLoading, user]);

  const article = articles.find((article) => article.name === articleId);

  const addUpVote = async () => {
    console.log("put userDetails", user);
    const token = user && (await user.getIdToken());
    const headers = token ? { authtoken: token } : {};
    const response = await axios.put(
      `/api/articles/${articleId}/upvote`,
      null,
      { headers }
    );
    const updatedArticleInfo = response.data;
    setArticleInfo(updatedArticleInfo);
  };

  const onArticleUpdated = (updatedArticle) => {
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      <h1>{article.title}</h1>
      <div className="upvotes-section">
        {user ? (
          <button onClick={addUpVote}>
            {canUpvote ? "Upvote!" : "Already Voted"}
          </button>
        ) : (
          <button>Login to upVote</button>
        )}
        <p>This article has {articleInfo.upvote} upvote(s)</p>{" "}
      </div>

      {article.content.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      {user ? (
        <AddCommentForm
          articleId={articleId}
          onArticleUpdated={onArticleUpdated}
        />
      ) : (
        <button>Login to comment</button>
      )}

      <CommentsList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;

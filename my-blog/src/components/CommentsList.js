const CommentsList = ({ comments }) => {
  return (
    <>
      <h3>Comments: </h3>
      {comments.map((comment) => (
        <div className="comment">
          <h4>Comments By: {comment.email}</h4>
          <p>{comment.text}</p>
        </div>
      ))}
    </>
  );
};

export default CommentsList;

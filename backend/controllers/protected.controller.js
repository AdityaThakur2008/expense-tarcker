export const getProfile = (req, res) => {
  res.status(200).json({
    message: "Protected route access granted.",
    user: req.user,
  });
};

const Authenticate = (req, res, next) => {
  const { userName, userEmail, userPassword } = req.body;
  if (!userName || !userEmail || !userPassword)
    return sendResponse(res, 400, { message: "Missing input" });
  next();
};

export default Authenticate;

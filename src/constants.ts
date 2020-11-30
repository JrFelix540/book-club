const constants = {
  USERID_COOKIE: `qid`,
  FORGOT_PASSWORD: `fgp`,
  __prod__: process.env.NODE_ENV === `production`,
};

export default constants;

const db = require("../db");
const { hash } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { SECRET } = require("../constants");

exports.getUserCredit = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(req.body);
    console.log("USERID", userId);
    const searchUser = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    const user = searchUser.rows[0];

    console.log(user);

    return res.status(200).json({
      credit: user.credit,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query(`select user_id, email from users`);

    return res.status(200).json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const hashedPassword = await hash(password, 10);
    const credit = 3;
    await db.query(
      "insert into users(email,password,name,credit) values ($1 , $2, $3, $4)",
      [email, hashedPassword, fullName, credit]
    );

    return res.status(201).json({
      success: true,
      message: "registration successful",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  let user = req.user;

  payload = {
    id: user.user_id,
    email: user.email,
  };
  try {
    const token = await sign(payload, SECRET);

    return res.status(200).cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Logged in successfully",
      token: token,
      user: user.user_id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.protected = async (req, res) => {
  try {
    return res.status(200).json({
      info: "protected info",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    return res.status(200).clearCookie("token", { httpOnly: true }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

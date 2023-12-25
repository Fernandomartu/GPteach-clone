const db = require("../db");

exports.updateUserCredit = async (email, paymentAmount) => {
  try {
    // Get the current credit value for the user
    const getUserCreditQuery = `
        SELECT credit
        FROM users
        WHERE email = $1
      `;

    const { rows } = await db.query(getUserCreditQuery, [email]);

    if (rows.length === 0) {
      // User not found with the given email
      throw new Error("User not found");
    }

    const currentCredit = rows[0].credit;

    // Update the credit value for the user
    const updateCreditQuery = `
        UPDATE users
        SET credit = $1
        WHERE email = $2
      `;

    console.log(parseFloat(currentCredit));

    const newCredit = parseFloat(currentCredit) + parseInt(paymentAmount);
    await db.query(updateCreditQuery, [newCredit, email]);

    console.log(`User with email ${email} updated. New credit: ${newCredit}`);
  } catch (error) {
    console.error("Error updating user credit:", error.message);
    throw error;
  }
};

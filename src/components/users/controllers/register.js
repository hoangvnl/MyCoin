import userModel from "../model";

const register = async (req, res) => {
  const { password } = req.body;
  try {
    await userModel.add(password);
    res.json({ message: "Wallet created successfully" });
  } catch (error) {
    res.json({
      message: "Create wallet unsuccessfully",
      error,
    });
  }
};

export default register;

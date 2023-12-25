import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "@/state";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const inputStyles = `mb-5 w-full rounded-lg bg-white px-5 py-3 placeholder-gray border border-gray-300 focus:border-blue-500`;
  const inputDivStyles = `flex flex-col justify-self-start self-start w-[100%]`;

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(4).max(20).required(),
  });

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    const loggedInResponse = await fetch(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const loggedIn = await loggedInResponse.json();

    console.log(loggedIn);
    if (loggedIn) {
      dispatch(
        setLogin({
          user: loggedIn.user,
          token: loggedIn.token,
        })
      );
      navigate("/home");
      console.log("working");
    }
  };

  return (
    <form
      target="_blank"
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
      className="bg-white p-10 flex flex-col gap-3 justify-center items-center rounded"
    >
      <h1 className="text-black font-bold text-xl">Login</h1>
      <p>Login to start learning</p>
      <div className={inputDivStyles}>
        <h3>Email</h3>
        <input
          className={inputStyles}
          type="text"
          placeholder="Email"
          {...register("email", { required: true, maxLength: 100 })}
        />{" "}
      </div>
      <div className={inputDivStyles}>
        <h3>Password</h3>
        <input
          className={inputStyles}
          type="password"
          placeholder="Password"
          {...register("password", { required: true, maxLength: 100 })}
        />{" "}
      </div>
      <button className="bg-tertiary-50 p-3 rounded text-white">Login</button>
    </form>
  );
};

export default Login;

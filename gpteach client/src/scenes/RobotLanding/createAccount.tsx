import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
type Props = {
  setView: (value: string) => void;
};

const CreateAccount = ({ setView }: Props) => {
  const inputStyles = `mb-5 w-full rounded-lg bg-white px-5 py-3 placeholder-gray border border-gray-300 focus:border-blue-500`;
  const inputDivStyles = `flex flex-col justify-self-start self-start w-[100%]`;

  const schema = yup.object().shape({
    fullName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(4).max(20).required(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), undefined])
      .required(),
  });

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      console.log(data);
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        // Successful submission, you can handle it accordingly
        console.log("Form data submitted successfully!");
        setView("login");
      } else {
        // Handle the error, for example, by logging it
        console.error("Failed to submit form data:", response.statusText);
      }
    } catch (error) {
      // Handle any network or unexpected error
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form
      target="_blank"
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
      className="bg-white p-10 flex flex-col gap-3 justify-center items-center rounded"
    >
      <h1 className="text-black font-bold text-xl">Create Your Account</h1>
      <p>Create an account to start learning</p>
      <div className={inputDivStyles}>
        <h3>Full Name</h3>
        <input
          className={inputStyles}
          type="text"
          placeholder="Full Name"
          {...register("fullName", { required: true, maxLength: 100 })}
        />{" "}
      </div>
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
      <div className={inputDivStyles}>
        <h3>Confirm Password</h3>
        <input
          className={inputStyles}
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", { required: true, maxLength: 100 })}
        />{" "}
      </div>
      <button className="bg-tertiary-50 p-3 rounded text-white">
        Create Your Account
      </button>
    </form>
  );
};

export default CreateAccount;

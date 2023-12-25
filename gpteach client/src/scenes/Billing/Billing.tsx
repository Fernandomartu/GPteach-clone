import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NavbarLoggedIn from "../Navbar/navbarLoggedIn";
import { useSelector } from "react-redux";

const Billing = () => {
  const token = useSelector((state: any) => state.token);
  const userId = useSelector((state: any) => state.user);
  const [currentCredit, setCurrentCredit] = useState<number | null>(null);

  const inputStyles = `mb-5 w-full rounded-lg bg-white px-5 py-3 placeholder-gray border border-gray-300 focus:border-blue-500`;
  const inputDivStyles = `flex flex-col justify-self-start self-start w-[100%]`;

  const schema = yup.object().shape({
    amount: yup
      .number()
      .required("Amount is required")
      .min(5, "Amount must be at least $5")
      .max(50, "Amount must be at most $50"),
  });

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const requestData = {
        amount: data.amount,
        customerEmail: "fernando.martu@gmail.com",
      };
      const paymentResponse = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL
        }/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const responseData = await paymentResponse.json();

      if (paymentResponse.ok) {
        console.log("Redirecting to:", responseData.url);
        window.location.href = responseData.url; // Redirect to the checkout page
      } else {
        // Handle error response
        console.error("Error creating checkout session:", responseData.error);
      }
    } catch (error) {
      console.error("An error occurred during the fetch:", error);
    }
  };

  const getUserCredit = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL}/api/get-user-credit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    const userCredit = await response.json();

    const credit = parseFloat(userCredit.credit);

    const creditFixed = credit.toFixed(3);
    console.log(creditFixed);

    setCurrentCredit(parseFloat(creditFixed));
  };

  useEffect(() => {
    getUserCredit();
  }, []);

  return (
    <div className="flex flex-col align-middle items-center w-full h-[100vh] bg-primary-50 gap-[100px]">
      <NavbarLoggedIn />
      <div>
        <h1 className="text-white text-xl">{`Current Credit $${currentCredit}`}</h1>
      </div>
      <div className="flex flex-col items-center p-10  bg-secondary-50 rounded">
        <h1>Add to Credit</h1>
        <form
          target="_blank"
          onSubmit={handleSubmit(onSubmit)}
          method="POST"
          className="bg-white p-10 flex flex-col gap-3 justify-center items-center rounded"
        >
          <div className={inputDivStyles}>
            <h3>Enter an amount between 5 and 50 $</h3>
            <input
              className={inputStyles}
              type="number"
              placeholder="Enter Amount"
              {...register("amount", { required: true, maxLength: 100 })}
            />{" "}
          </div>
          <button className="bg-tertiary-50 p-3 rounded text-white">Pay</button>
        </form>
      </div>
    </div>
  );
};

export default Billing;

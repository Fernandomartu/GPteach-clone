import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "@/state";

const NavbarLoggedIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonStyles = `bg-tertiary-50 p-3 rounded w-[200px] text-white`;

  const logout = () => {
    dispatch(
      setLogin({
        user: undefined,
        token: undefined,
      })
    );
  };

  return (
    <nav className="w-full flex justify-between p-10">
      <div>
        <h1 className="text-3xl text-white">GPTeach</h1>
      </div>
      <div className="flex gap-10">
        <button
          onClick={() => {
            logout();
          }}
          className={buttonStyles}
        >
          Logout
        </button>
        {location.pathname === "/billing" ? (
          <button
            onClick={() => {
              navigate("/home");
            }}
            className={buttonStyles}
          >
            Home
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/billing");
            }}
            className={buttonStyles}
          >
            Billing
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavbarLoggedIn;

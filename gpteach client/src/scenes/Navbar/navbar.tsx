type Props = {
  setView: (value: string) => void;
};

const Navbar = ({ setView }: Props) => {
  const buttonStyles = `bg-tertiary-50 p-3 rounded w-[200px] text-white`;

  return (
    <nav className="w-full flex justify-between p-10">
      <div>
        <h1 className="text-3xl text-white">GPTeach</h1>
      </div>
      <div className="flex gap-10">
        <button
          className={buttonStyles}
          onClick={() => {
            setView("create");
          }}
        >
          Create Account
        </button>
        <button
          onClick={() => {
            setView("login");
          }}
          className={buttonStyles}
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

const LandingHeader = () => {
  return (
    <nav>
      <div className="flex w-full bg-primary-50 py-8 text-xl justify-between px-20">
        <div>
          <h3 className="text-3xl font-bold">GPTeach</h3>
        </div>

        <div>
          <button className="text-3xl font-bold">Login</button>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;

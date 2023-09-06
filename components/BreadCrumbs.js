import Link from "next/link";

const Breadcrumbs = ({ navList }) => {
  return (
    <div className="my-4 max-md:pl-2 md:pl-4 whitespace-nowrap">
      {navList.map((item, i) => (
        <div className={"inline"} key={i}>
          {item.link ? (
            <>
              <Link
                href={item.link}
                className={`${
                  item.active
                    ? "text-primary font-bold"
                    : "text-slate-500  font-semibold"
                } text-sm md:text-md ${i > 0 && "pl-2"}`}
              >
                {item.name || item.title}
              </Link>
            </>
          ) : (
            <span className={` text-slate-500 cursor-pointer text-md`}>
              {item.name || item.title}
            </span>
          )}
          {i !== navList.length - 1 && (
            <span className=" text-slate-500 pl-2 ">&gt;</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;

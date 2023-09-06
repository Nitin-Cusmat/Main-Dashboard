import Button from "./Button";

export const Pagination = ({
  activePage,
  count,
  rowsPerPage,
  totalPages,
  setActivePage
}) => {
  const beginning = activePage === 1 ? 1 : rowsPerPage * (activePage - 1) + 1;
  const end = activePage === totalPages ? count : beginning + (rowsPerPage - 1);

  return (
    <>
      <div className="pagination flex justify-between pt-4">
        <p className="text-dark text-sm md:text-md w-1/2">
          Showing {beginning === end ? end : `${beginning} - ${end}`} of {count}{" "}
          entries
        </p>
        <div className="flex flex-wrap w-full justify-end">
          <Button
            disabled={activePage === 1}
            onClick={() => setActivePage(activePage - 1)}
            btnVariant={activePage === 1 ? "light" : "plain"}
          >
            Previous
          </Button>
          <Button
            disabled={activePage === totalPages}
            onClick={() => setActivePage(activePage + 1)}
            btnVariant={activePage === totalPages ? "light" : "plain"}
            className={"ml-2 px-4 py-2 rounded font-semibold"}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

import { AiOutlineSearch } from "react-icons/ai";
import appRoutes from "utils/app-routes";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import { HTTP_STATUSES } from "utils/constants";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { reverse } from "named-urls";

const SearchBar = ({ organization }) => {
  const router = useRouter();
  const [modules, setModules] = useState(null);
  const [users, setUsers] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef(null);

  const getOrgModules = async () => {
    let filterString = `search=${searchFilter}`;
    if (organization) {
      filterString = filterString + `&organization_id=${organization.id}`;
    }

    const res = await request(
      `${apiRoutes.organization.modules}?${filterString}`,
      {
        isAuthenticated: true
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setModules(resJson.results);
    }
  };

  const getUsers = async () => {
    const url = `${apiRoutes.accounts.listUsers}?&organization_id=${organization.id}&search=${searchFilter}&limit=6&offset=0`;
    const res = await request(url, {
      isAuthenticated: true
    });
    if (res.status == HTTP_STATUSES.OK) {
      let resJson = await res.json();
      setUsers(resJson.results);
    }
  };

  useEffect(() => {
    if (searchFilter != "") {
      setLoading(true);
      getUsers();
      getOrgModules();
      setLoading(false);
    }
  }, [searchFilter]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="py-2 px-2 md:px-4 relative flex justify-center "
      ref={searchBarRef}
    >
      <div className="md:max-w-[300px] flex">
        <div className="inline bg-[#F4F3F8] p-1 rounded-tl rounded-bl">
          <button className=" h-full  text-primary md:pl-3 cursor-default">
            <AiOutlineSearch size="20" className="" />
          </button>
        </div>
        <input
          type="text"
          className="rounded-tr rounded-br p-2 text-sm md:text-md bg-[#F4F3F8] !focus:border-0 !outline-none w-full"
          placeholder="Search"
          value={searchFilter}
          onClick={() => setShowSearchResults(true)}
          onChange={e => {
            setSearchFilter(e.target.value);
          }}
        />
      </div>

      <div
        className={`${
          showSearchResults
            ? "absolute top-[55px] z-50 bg-white left-2 shadow overflow-scroll w-full"
            : "hidden"
        } `}
      >
        {loading ? (
          <div className="pt-2 pb-1 border-t text-sm bg-white m-2">
            loading...
          </div>
        ) : searchFilter.length > 0 ? (
          <div className="m-3">
            <div className="py-1 font-semibold text-md">Users</div>
            {users && users.length > 0 ? (
              users.map(user => (
                <div
                  className="py-2 text-dark text-sm flex justify-between cursor-pointer hover:bg-[#5256B82B]"
                  key={user.id}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchFilter("");
                    router.push(
                      reverse(appRoutes.reports.individual.performance, {
                        userId: user.user_id
                      })
                    );
                  }}
                >
                  <span>{user.first_name + " " + user.last_name}</span>
                  <span className="text-xs mt-auto">{user.user_id}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-sm">No users found</div>
            )}
            <div className="py-1 font-semibold text-md">Modules</div>
            {modules && modules.length > 0 ? (
              modules.map(module => (
                <div
                  className="py-2  text-sm flex justify-between cursor-pointer hover:bg-[#5256B82B]"
                  key={module.module.id}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchFilter("");
                    router.push({
                      pathname: appRoutes.useCases,
                      query: {
                        searchModule: module.module.name
                      }
                    });
                  }}
                >
                  <span>{module.module.name}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-sm">No modules found</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;

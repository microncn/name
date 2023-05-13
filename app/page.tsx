"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import va from "@vercel/analytics";
import { log } from "next-axiom";

interface Data {
  country: [Country];
  gender: Gender;
}

interface Country {
  country_id: string;
  probability: number;
}

interface Gender {
  gender: string;
  probability: number;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [data, setData] = useState<Data>();

  const regions = new Intl.DisplayNames(["en"], { type: "region" });

  log.info("home");
  async function getData(event: any) {
    event.preventDefault();
    log.info("test", { name });
    va.track("name", { name });

    const [nationalityResponse, genderResponse] = await Promise.all([
      fetch(`https://api.nationalize.io?name=${name}`),
      fetch(`https://api.genderize.io?name=${name}`),
    ]);
    const [{ country }, gender] = [
      await nationalityResponse.json(),
      await genderResponse.json(),
    ];
    setData({ country, gender });
  }
  return (
    <main className="flex justify-center pt-32">
      <div className="w-[400px] flex flex-col px-2">
        <form onSubmit={getData} className="mb-4">
          <input
            type="text"
            className="border border-neutral-800 text-sm text-white px-2 py-1.5 rounded-md outline-none bg-transparent focus:bg-neutral-900 duration-200 placeholder:text-neutral-400 w-full"
            placeholder="Enter your name"
            onChange={({ target }) => setName(target.value)}
          />
        </form>
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-md border border-neutral-800 p-1 mb-2">
            <Tab
              className={({ selected }) =>
                `${
                  selected ? "text-white bg-neutral-900" : "text-neutral-400"
                } text-sm py-1.5 rounded w-full outline-none`
              }
            >
              Nationality
            </Tab>
            <Tab
              className={({ selected }) =>
                `${
                  selected ? "text-white bg-neutral-900" : "text-neutral-400"
                } text-sm py-1.5 rounded w-full outline-none`
              }
            >
              Gender
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="gap-2 flex flex-col">
              {data?.country &&
                data.country.map((foo, index) => (
                  <div className="border border-neutral-800 px-2 py-1.5 rounded-md justify-between flex">
                    <span className="text-sm text-white font-semibold">
                      {`${index + 1}. ${regions.of(foo.country_id)}`}
                    </span>
                    <span className="text-sm text-emerald-500">
                      {`${Math.round(foo.probability * 100)}%`}
                    </span>
                  </div>
                ))}
            </Tab.Panel>
            <Tab.Panel>
              <div className="border border-neutral-800 px-2 py-1.5 rounded-md flex flex-col text-center">
                <span className="text-xl text-white font-semibold">
                  {data?.gender.gender.toUpperCase()}
                </span>
                <span className="text-lg text-emerald-500 font-semibold">
                  {`${Math.round((data?.gender.probability ?? 0) * 100)}%`}
                </span>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </main>
  );
}

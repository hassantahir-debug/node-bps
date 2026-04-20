export const nf2DataService = async (id, req) => {
  const cookies = req.headers.cookie || "";
  const res = await fetch(
    `${process.env.LARAVEL_URL}/api/accidentdetails/${id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch NF2 data");
  }

  const data = await res.json();
  return data;
};

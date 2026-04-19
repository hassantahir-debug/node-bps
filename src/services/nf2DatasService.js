export const nf2DataService = async (id) => {
  const res = await fetch(`${process.env.LARAVEL_URL}/api/accidentdetails/${id}`, {
      method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch NF2 data");
  }

  const data = await res.json();
  return data;
};
// mapRowFn - Function to transform each row into an array of values matching header order
export function exportToCSV<T>(
  data: T[],
  headers: string[],
  filename: string,
  mapRowFn: (item: T) => (string | number)[]
): void {
  const csvContent = [
    headers.join(","),
    ...data.map((item) =>
      mapRowFn(item)
        .map((value) => {
          // Wrap string values in quotes and escape internal quotes
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

import { useEffect, useMemo, useRef, useState } from "react";
import { getTaxes, updateTax } from "../api/taxes";
import { getCountries } from "../api/countries";
import type { Tax } from "../api/taxes";
import type { Country } from "../api/countries";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import EditCustomerModal from "./editcustomermodel";

function TaxesTable() {
  const [data, setData] = useState<Tax[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // filter state
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // edit modal state
  const [editingRow, setEditingRow] = useState<Tax | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  // ref used to detect clicks outside country filter popover
  const countryFilterRef = useRef<HTMLDivElement | null>(null);

  // load taxes + countries on mount
  useEffect(() => {
    async function load() {
      try {
        const [taxes, countryList] = await Promise.all([
          getTaxes(),
          getCountries(),
        ]);
        setData(taxes);
        setCountries(countryList);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // close country filter when clicking outside
  useEffect(() => {
    if (!countryFilterOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!countryFilterRef.current) return;
      if (!countryFilterRef.current.contains(event.target as Node)) {
        setCountryFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryFilterOpen]);

  // apply country filter to data
  const filteredData = useMemo(() => {
    if (selectedCountries.length === 0) return data;
    return data.filter((row) => selectedCountries.includes(row.country));
  }, [data, selectedCountries]);

  const toggleCountryInFilter = (countryName: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryName)
        ? prev.filter((c) => c !== countryName)
        : [...prev, countryName]
    );
  };

  const clearCountryFilter = () => setSelectedCountries([]);

  const columns = useMemo<ColumnDef<Tax>[]>(
    () => [
      {
        header: "Entity",
        accessorKey: "entity",
        cell: (info) => (
          <button className="link-cell" type="button">
            {info.getValue<string>()}
          </button>
        ),
      },
      {
        header: "Gender",
        accessorKey: "gender",
        cell: (info) => {
          const value = info.getValue<string>();
          const isMale = value.toLowerCase() === "male";

          return (
            <span
              className={`badge ${isMale ? "badge-male" : "badge-female"}`}
            >
              {value}
            </span>
          );
        },
      },
      {
  id: "requestDate",
  header: "Request date",
  accessorKey: "createdAt",
  cell: (info) => {
    const iso = info.getValue<string>();
    if (!iso) return "-"; // fallback
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  },
},

      {
        id: "country",
        accessorKey: "country",
        header: () => (
          <div className="country-header">
            <span>Country</span>
            <div
              className="country-filter-wrapper"
              ref={countryFilterRef}
            >
              <button
                type="button"
                className={
                  "country-filter-button" +
                  (countryFilterOpen || selectedCountries.length > 0
                    ? " country-filter-button--active"
                    : "")
                }
                onClick={() => setCountryFilterOpen((open) => !open)}
                aria-label="Filter by country"
              >
                🔍
              </button>
              {countryFilterOpen && (
                <div className="country-filter-popover">
                  <div className="country-filter-header">
                    <span>Filter country</span>
                    {selectedCountries.length > 0 && (
                      <button
                        type="button"
                        className="country-filter-clear"
                        onClick={clearCountryFilter}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="country-filter-list">
                    {countries.map((c) => {
                      const checked = selectedCountries.includes(c.name);
                      return (
                        <label
                          key={c.id}
                          className="country-filter-option"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCountryInFilter(c.name)}
                          />
                          <span>{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
        cell: (info) => info.getValue<string>(),
      },
      {
        id: "actions",
        header: "",
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              className="icon-button"
              type="button"
              onClick={() => {
                setSaveError("");
                setEditingRow(row);
              }}
            >
              ✏️
            </button>
          );
        },
        size: 40,
      },
    ],
    [countries, countryFilterOpen, selectedCountries]
  );

  const table = useReactTable<Tax>({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCloseModal = () => {
    setEditingRow(null);
    setSaveError("");
  };

  const handleSaveFromModal = async (values: {
    name: string;
    country: string;
  }) => {
    if (!editingRow) return;

    try {
      setIsSaving(true);
      setSaveError("");

      const payload: Partial<Tax> = {
        ...editingRow,
        entity: values.name,
        country: values.country,
      };

      const updated = await updateTax(editingRow.id, payload);

      // update local table state
      setData((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );

      handleCloseModal();
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading table...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="table-card">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
  {table.getRowModel().rows.length === 0 ? (
    <tr>
      <td colSpan={table.getAllColumns().length}>
        <div style={{ padding: "24px 8px", textAlign: "center", color: "#7a7a9a" }}>
          No results found. Try clearing or changing the country filter.
        </div>
      </td>
    </tr>
  ) : (
    table.getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id}>
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}
          </td>
        ))}
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {editingRow && (
        <EditCustomerModal
          customer={editingRow}
          countries={countries}
          onClose={handleCloseModal}
          onSave={handleSaveFromModal}
          isSaving={isSaving}
          error={saveError}
        />
      )}
    </>
  );
}

export default TaxesTable;

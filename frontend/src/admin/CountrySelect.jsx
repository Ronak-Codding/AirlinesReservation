import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import ReactCountryFlag from "react-country-flag";

const CountrySelect = ({ value, onChange }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,cca2",
        );

        const formatted = res.data
          .map((c) => ({
            label: c.name.common,
            value: c.name.common,
            code: c.cca2,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountries(formatted);
      } catch (error) {
        console.error("Country load error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const formatOptionLabel = ({ label, code }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <ReactCountryFlag
        svg
        countryCode={code}
        style={{ width: "1.5em", height: "1.5em" }}
      />
      <span>{label}</span>
    </div>
  );

  return (
    <Select
      options={countries}
      value={countries.find((c) => c.value === value)}
      onChange={(e) => onChange(e.value)}
      formatOptionLabel={formatOptionLabel}
      placeholder={loading ? "Loading countries..." : "Select Country"}
      isSearchable
      isLoading={loading}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      classNamePrefix="country-select"
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "transparent",
          borderColor: "black",
          boxShadow: "none",
          minHeight: "36px",
          height: "36px",
          "&:hover": {
            borderColor: "black",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          height: "36px",
          padding: "0 8px",
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          color: "black",
        }),
        singleValue: (base) => ({
          ...base,
          color: "black",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#666",
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "black",
          padding: "4px",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 99999,
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 99999,
        }),
      }}
    />
  );
};

export default CountrySelect;

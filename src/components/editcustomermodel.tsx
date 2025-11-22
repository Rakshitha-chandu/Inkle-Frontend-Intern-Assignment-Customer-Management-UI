import { useState } from "react";
import type { FormEvent } from "react";
import type { Tax } from "../api/taxes";
import type { Country } from "../api/countries";

type EditCustomerModalProps = {
  customer: Tax;
  countries: Country[];
  onClose: () => void;
  onSave: (values: { name: string; country: string }) => void;
  isSaving?: boolean;
  error?: string;
};

function EditCustomerModal({
  customer,
  countries,
  onClose,
  onSave,
  isSaving = false,
  error,
}: EditCustomerModalProps) {
  // initialize editable fields
  const [name, setName] = useState(() => customer.entity ?? "");
  const [country, setCountry] = useState(() => customer.country ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) return;
    onSave({ name: name.trim(), country });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2>Edit Customer</h2>
          <button
            type="button"
            className="icon-button modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name */}
            <div className="form-field">
              <label className="field-label">
                Name <span className="required">*</span>
              </label>
              <input
                className="text-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer name"
              />
            </div>

            {/* Country */}
            <div className="form-field">
              <label className="field-label">
                Country <span className="required">*</span>
              </label>
              <select
                className="select-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Error message */}
            {error && <p className="error-text">{error}</p>}
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !name.trim() || !country}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;

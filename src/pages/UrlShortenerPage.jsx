import React, { useState } from "react";
import {
  Container, Typography, TextField, Button,
  Grid, Paper, Box,
} from "@mui/material";
import { logInfo, logError } from "../utils/logger";
import { isValidUrl, isValidShortcode, isPositiveInteger } from "../utils/validators";
import { safeApiFetch } from "../utils/safeApiFetch";
import { useNavigate } from "react-router-dom";

export default function UrlShortenerPage() {
  const [inputs, setInputs] = useState([
    { url: "", validity: "", shortcode: "", errors: {} },
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateInput = (idx, field, value) => {
    const copy = [...inputs];
    copy[idx][field] = value;
    copy[idx].errors = {};
    setInputs(copy);
  };

  const addRow = () => {
    if (inputs.length < 5) setInputs([...inputs, { url: "", validity: "", shortcode: "", errors: {} }]);
  };

  const removeRow = (idx) => {
    if (inputs.length > 1) setInputs(inputs.filter((_, i) => i !== idx));
  };

  const validateAll = () => {
    let valid = true;
    const urls = new Set();
    const shortcodes = new Set();
    const newInputs = inputs.map((input) => {
      const errors = {};
      if (!input.url || !isValidUrl(input.url.trim())) {
        errors.url = "Invalid URL.";
        valid = false;
      } else if (urls.has(input.url.trim())) {
        errors.url = "Duplicate URL.";
        valid = false;
      } else {
        urls.add(input.url.trim());
      }
      if (input.validity && !isPositiveInteger(input.validity.trim())) {
        errors.validity = "Validity must be a positive integer.";
        valid = false;
      }
      if (input.shortcode) {
        if (!isValidShortcode(input.shortcode.trim())) {
          errors.shortcode = "Shortcode must be alphanumeric 3-10 chars.";
          valid = false;
        } else if (shortcodes.has(input.shortcode.trim())) {
          errors.shortcode = "Duplicate shortcode.";
          valid = false;
        } else {
          shortcodes.add(input.shortcode.trim());
        }
      }
      return { ...input, errors };
    });
    setInputs(newInputs);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      await logError("Validation failed", inputs);
      return;
    }

    setLoading(true);
    try {
      const postPromises = inputs.map(async ({ url, validity, shortcode }) => {
        const body = { url: url.trim() };
        if (validity && validity.trim() !== "") body.validity = parseInt(validity.trim(), 10);
        if (shortcode && shortcode.trim() !== "") body.shortcode = shortcode.trim();

        const data = await safeApiFetch("http://20.244.56.144/evaluation-service/shorturls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        return data;
      });

      const apiResults = await Promise.all(postPromises);
      setResults(apiResults);
      await logInfo("URLs shortened", apiResults);
      setInputs([{ url: "", validity: "", shortcode: "", errors: {} }]);
    } catch (err) {
      await logError("Error shortening URLs", { error: err.message });
      alert(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>

      {inputs.map((input, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Original Long URL"
                fullWidth
                required
                value={input.url}
                onChange={(e) => updateInput(i, "url", e.target.value)}
                error={!!input.errors.url}
                helperText={input.errors.url}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Validity (minutes)"
                fullWidth
                value={input.validity}
                onChange={(e) => updateInput(i, "validity", e.target.value)}
                error={!!input.errors.validity}
                helperText={input.errors.validity || "Defaults to 30 if empty"}
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Custom Shortcode"
                fullWidth
                value={input.shortcode}
                onChange={(e) => updateInput(i, "shortcode", e.target.value)}
                error={!!input.errors.shortcode}
                helperText={input.errors.shortcode || "Optional, 3-10 alphanumeric chars"}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              {inputs.length > 1 && (
                <Button color="error" variant="outlined" onClick={() => removeRow(i)}>
                  Remove
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      ))}

      {inputs.length < 5 && (
        <Button variant="text" onClick={addRow}>Add URL</Button>
      )}

      <Box mt={3}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : "Shorten URLs"}
        </Button>
      </Box>

      {results.length > 0 && (
        <Box mt={5}>
          <Typography variant="h5">Shortened URLs</Typography>
          {results.map(({ shortLink, expiry }, i) => (
            <Paper key={i} sx={{ p: 2, mt: 2 }}>
              <Typography>
                <a href={shortLink} target="_blank" rel="noopener noreferrer">{shortLink}</a>
              </Typography>
              <Typography>Expires At: {new Date(expiry).toLocaleString()}</Typography>
            </Paper>
          ))}
          <Box mt={2}>
            <Button variant="outlined" onClick={() => navigate("/stats")}>View Statistics</Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}

console.log("rnejkng")
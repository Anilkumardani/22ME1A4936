import React, { useState, useEffect } from "react";
import {
  Container, Typography, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Collapse, IconButton, Box,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { logInfo, logError } from "../utils/logger";
import { safeApiFetch } from "../utils/safeApiFetch";

export default function StatsPage() {
  const [urlStats, setUrlStats] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const stored = JSON.parse(localStorage.getItem("shortenedUrls") || "[]");
        const lastShortcodes = stored.slice(-5).map((u) => u.shortcode);

        const results = await Promise.all(
          lastShortcodes.map(async (code) => {
            return await safeApiFetch(`http://20.244.56.144/evaluation-service/shorturls/${code}`);
          })
        );

        await logInfo("Fetched URL statistics", lastShortcodes);
        setUrlStats(results);
      } catch (error) {
        await logError("Error fetching statistics", { error: error.message });
        alert("Error fetching statistics. Please try again.");
      }
    }
    fetchStats();
  }, []);

  const toggleExpand = (code) => {
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom>URL Statistics</Typography>
      {urlStats.length === 0 && <Typography>No statistics available.</Typography>}

      {urlStats.map((stat) => (
        <Paper key={stat.shortcode} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">
            <a href={`http://localhost:3000/${stat.shortcode}`} target="_blank" rel="noopener noreferrer">
              {`http://localhost:3000/${stat.shortcode}`}
            </a>
          </Typography>
          <Typography>Original URL: {stat.originalUrl}</Typography>
          <Typography>Created At: {new Date(stat.createdAt).toLocaleString()}</Typography>
          <Typography>Expires At: {new Date(stat.expiry).toLocaleString()}</Typography>
          <Typography>Total Clicks: {stat.totalClicks}</Typography>

          {stat.totalClicks > 0 && (
            <Box sx={{ mt: 1 }}>
              <IconButton size="small" onClick={() => toggleExpand(stat.shortcode)}>
                {expanded[stat.shortcode] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
              <Typography component="span">Show Click Details</Typography>
              <Collapse in={expanded[stat.shortcode]} timeout="auto" unmountOnExit>
                <TableContainer sx={{ maxHeight: 300, mt: 1 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Referrer</TableCell>
                        <TableCell>Geo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stat.clicks.map((click, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{click.referrer || "Unknown"}</TableCell>
                          <TableCell>{click.geo || "Unavailable"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          )}
        </Paper>
      ))}
    </Container>
  );
}

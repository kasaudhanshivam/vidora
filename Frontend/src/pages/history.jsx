import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

export default function History() {
  const { getUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();
  
  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchHistory = async () => {
      const { history } = await getUserHistory();
      setMeetings(history);
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f4ff, #e6f0ff)",
        p: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          mb: {
            xs: 3,
            sm: 4,
          },
          gap: {
            xs: 2,
            sm: 0,
          },
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: "bold", 
            color: "#2c3e50",
            display: "flex",
            alignItems: "center",
          }}
        >
          <HistoryIcon sx={{ 
            mr: 1, 
            color: "#1976d2",
            fontSize: isMobile ? "1.5rem" : "2rem"
          }} />
          Meeting History
        </Typography>

        <Button
          onClick={() => routeTo("/home")}
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#145ca8" },
            borderRadius: "8px",
            textTransform: "none",
            px: {
              xs: 2,
              sm: 3,
            },
            py: {
              xs: 1,
              sm: 1.5,
            },
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          Home
        </Button>
      </Box>

      {/* Meetings List */}
      {meetings.length !== 0 ? (
        <Grid container spacing={{
          xs: 2,
          sm: 3,
        }}>
          {meetings.map((meeting, index) => (
            <Grid item 
              xs={12}   // Full width on all screens (removed other breakpoints)
              key={index}
            >
              <Card
                sx={{
                  borderRadius: {
                    xs: "12px",
                    sm: "16px",
                  },
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: {
                      xs: "none",
                      sm: "translateY(-5px)",
                    },
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  },
                  background: "white",
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  width: "100%", // Ensure full width
                }}
              >
                <CardContent sx={{ 
                  p: {
                    xs: 1,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1,
                      sm: 2,
                    }
                  }
                }}>
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                      color: "#1976d2",
                      mb: {
                        xs: 1,
                        sm: 2,
                      },
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.1rem",
                      },
                    }}
                  >
                    <MeetingRoomIcon sx={{ 
                      mr: 1,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.25rem",
                      }
                    }} /> 
                    {meeting.meeting_code}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      mb: 1,
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.875rem",
                      },
                    }}
                  >
                    <CalendarTodayIcon sx={{ 
                      mr: 1, 
                      fontSize: {
                        xs: 16,
                        sm: 18,
                      }
                    }} />
                    {formatDate(meeting.date)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontStyle: "italic",
                      mt: {
                        xs: 0.5,
                        sm: 1,
                      },
                      color: "#666",
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                      },
                    }}
                  >
                    Meeting successfully recorded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            mt: {
              xs: 5,
              sm: 10,
            },
            color: "#555",
            px: {
              xs: 2,
              sm: 0,
            },
          }}
        >
          <HistoryIcon sx={{ 
            fontSize: {
              xs: 40,
              sm: 60,
            }, 
            color: "#ccc", 
            mb: 2 
          }} />
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 1 }}>
            No meetings yet.
          </Typography>
          <Typography variant="body2" sx={{ 
            mt: 1, 
            color: "#777",
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
          }}>
            Your past meetings will appear here once you start hosting or
            joining them.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
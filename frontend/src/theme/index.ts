import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1B5E20", // Deep forest green
      light: "#4CAF50",
      dark: "#0D3A0E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FF8F00", // Golf orange/amber
      light: "#FFB74D",
      dark: "#F57C00",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#C62828",
    },
    warning: {
      main: "#FF8F00",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    info: {
      main: "#1976D2",
      light: "#42A5F5",
      dark: "#1565C0",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#616161",
    },
    divider: "#E0E0E0",
    grey: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
      "@media (max-width:900px)": {
        fontSize: "2.25rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.875rem",
      },
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.00833em",
      "@media (max-width:900px)": {
        fontSize: "1.75rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0em",
      "@media (max-width:900px)": {
        fontSize: "1.5rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.375rem",
      },
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.00735em",
      "@media (max-width:900px)": {
        fontSize: "1.375rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "0em",
      "@media (max-width:900px)": {
        fontSize: "1.125rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "0.0075em",
      "@media (max-width:600px)": {
        fontSize: "1.0625rem",
      },
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: "0.00938em",
      "@media (max-width:600px)": {
        fontSize: "0.9375rem",
      },
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: "0.00714em",
      "@media (max-width:600px)": {
        fontSize: "0.8125rem",
      },
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0.00938em",
      "@media (max-width:600px)": {
        fontSize: "0.9375rem",
        lineHeight: 1.55,
      },
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.57,
      letterSpacing: "0.00714em",
      "@media (max-width:600px)": {
        fontSize: "0.8125rem",
        lineHeight: 1.5,
      },
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.71,
      letterSpacing: "0.02857em",
      textTransform: "none",
      "@media (max-width:600px)": {
        fontSize: "0.8125rem",
      },
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: "0.03333em",
      "@media (max-width:600px)": {
        fontSize: "0.6875rem",
      },
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 2.66,
      letterSpacing: "0.08333em",
      textTransform: "uppercase",
      "@media (max-width:600px)": {
        fontSize: "0.6875rem",
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shadows: [
    "none",
    "0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.12),0px 1px 3px 0px rgba(0,0,0,0.10)",
    "0px 3px 1px -2px rgba(0,0,0,0.08),0px 2px 2px 0px rgba(0,0,0,0.12),0px 1px 5px 0px rgba(0,0,0,0.10)",
    "0px 3px 3px -2px rgba(0,0,0,0.08),0px 3px 4px 0px rgba(0,0,0,0.12),0px 1px 8px 0px rgba(0,0,0,0.10)",
    "0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.12),0px 1px 10px 0px rgba(0,0,0,0.10)",
    "0px 3px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.12),0px 1px 14px 0px rgba(0,0,0,0.10)",
    "0px 3px 5px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.12),0px 1px 18px 0px rgba(0,0,0,0.10)",
    "0px 4px 5px -2px rgba(0,0,0,0.08),0px 7px 10px 1px rgba(0,0,0,0.12),0px 2px 16px 1px rgba(0,0,0,0.10)",
    "0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.12),0px 3px 14px 2px rgba(0,0,0,0.10)",
    "0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.12),0px 3px 16px 2px rgba(0,0,0,0.10)",
    "0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.12),0px 4px 18px 3px rgba(0,0,0,0.10)",
    "0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.12),0px 4px 20px 3px rgba(0,0,0,0.10)",
    "0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.12),0px 5px 22px 4px rgba(0,0,0,0.10)",
    "0px 7px 9px -4px rgba(0,0,0,0.08),0px 13px 19px 2px rgba(0,0,0,0.12),0px 5px 24px 4px rgba(0,0,0,0.10)",
    "0px 8px 9px -5px rgba(0,0,0,0.08),0px 15px 22px 2px rgba(0,0,0,0.12),0px 6px 28px 5px rgba(0,0,0,0.10)",
    "0px 8px 10px -5px rgba(0,0,0,0.08),0px 16px 24px 2px rgba(0,0,0,0.12),0px 6px 30px 5px rgba(0,0,0,0.10)",
    "0px 8px 11px -5px rgba(0,0,0,0.08),0px 17px 26px 2px rgba(0,0,0,0.12),0px 6px 32px 5px rgba(0,0,0,0.10)",
    "0px 9px 11px -5px rgba(0,0,0,0.08),0px 18px 28px 2px rgba(0,0,0,0.12),0px 7px 34px 6px rgba(0,0,0,0.10)",
    "0px 9px 12px -6px rgba(0,0,0,0.08),0px 19px 29px 2px rgba(0,0,0,0.12),0px 7px 36px 6px rgba(0,0,0,0.10)",
    "0px 10px 13px -6px rgba(0,0,0,0.08),0px 20px 31px 3px rgba(0,0,0,0.12),0px 8px 38px 7px rgba(0,0,0,0.10)",
    "0px 10px 13px -6px rgba(0,0,0,0.08),0px 21px 33px 3px rgba(0,0,0,0.12),0px 8px 40px 7px rgba(0,0,0,0.10)",
    "0px 10px 14px -6px rgba(0,0,0,0.08),0px 22px 35px 3px rgba(0,0,0,0.12),0px 8px 42px 7px rgba(0,0,0,0.10)",
    "0px 11px 14px -7px rgba(0,0,0,0.08),0px 23px 36px 3px rgba(0,0,0,0.12),0px 9px 44px 8px rgba(0,0,0,0.10)",
    "0px 11px 15px -7px rgba(0,0,0,0.08),0px 24px 38px 3px rgba(0,0,0,0.12),0px 9px 46px 8px rgba(0,0,0,0.10)",
    "0px 12px 16px -8px rgba(0,0,0,0.08),0px 25px 40px 3px rgba(0,0,0,0.12),0px 10px 48px 8px rgba(0,0,0,0.10)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          // Prevent zoom on input focus on iOS
          "@media (max-width: 600px)": {
            WebkitTextSizeAdjust: "100%",
          },
        },
        body: {
          scrollBehavior: "smooth",
          // Improve touch scrolling on mobile
          WebkitOverflowScrolling: "touch",
        },
        "*": {
          boxSizing: "border-box",
        },
        "*:before": {
          boxSizing: "border-box",
        },
        "*:after": {
          boxSizing: "border-box",
        },
        // Custom scrollbar for webkit browsers
        "::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: "#F5F5F5",
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "#BDBDBD",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "#9E9E9E",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          textTransform: "none",
          fontWeight: 500,
          boxShadow: "none",
          minHeight: "44px", // Improved touch target
          "&:hover": {
            boxShadow: "0px 2px 8px rgba(0,0,0,0.12)",
          },
          "&:active": {
            boxShadow: "0px 1px 4px rgba(0,0,0,0.16)",
          },
          "@media (max-width:600px)": {
            padding: "12px 20px",
            fontSize: "0.875rem",
            minHeight: "48px", // Larger touch target on mobile
            borderRadius: 10,
          },
        },
        contained: {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
          },
          "&:active": {
            boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
          "@media (max-width:600px)": {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
            },
          },
        },
        sizeSmall: {
          padding: "8px 16px",
          fontSize: "0.8125rem",
          minHeight: "36px",
          "@media (max-width:600px)": {
            padding: "10px 16px",
            minHeight: "40px",
          },
        },
        sizeLarge: {
          padding: "14px 28px",
          fontSize: "0.9375rem",
          minHeight: "52px",
          "@media (max-width:600px)": {
            padding: "16px 24px",
            minHeight: "56px",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: "12px",
          "@media (max-width:600px)": {
            padding: "14px", // Larger touch target on mobile
          },
        },
        sizeSmall: {
          padding: "8px",
          "@media (max-width:600px)": {
            padding: "10px",
          },
        },
        sizeLarge: {
          padding: "16px",
          "@media (max-width:600px)": {
            padding: "18px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
          },
          transition: "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
          "@media (max-width:600px)": {
            borderRadius: 12,
            "&:active": {
              transform: "scale(0.98)",
            },
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
          "@media (max-width:900px)": {
            padding: "20px",
            "&:last-child": {
              paddingBottom: "20px",
            },
          },
          "@media (max-width:600px)": {
            padding: "16px",
            "&:last-child": {
              paddingBottom: "16px",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#1A1A1A",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "64px !important",
          paddingLeft: "24px",
          paddingRight: "24px",
          "@media (max-width:900px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
          },
          "@media (max-width:600px)": {
            minHeight: "56px !important",
            paddingLeft: "16px",
            paddingRight: "16px",
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
          "@media (max-width:900px)": {
            paddingLeft: "20px",
            paddingRight: "20px",
          },
          "@media (max-width:600px)": {
            paddingLeft: "16px",
            paddingRight: "16px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
        },
        elevation2: {
          boxShadow: "0px 4px 8px rgba(0,0,0,0.08)",
        },
        elevation3: {
          boxShadow: "0px 8px 16px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FAFAFA",
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1B5E20",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1B5E20",
              borderWidth: 2,
            },
            "@media (max-width:600px)": {
              borderRadius: 10,
            },
          },
          "& .MuiInputLabel-root": {
            "@media (max-width:600px)": {
              fontSize: "0.9375rem",
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          "@media (max-width:600px)": {
            fontSize: "16px", // Prevents zoom on mobile Safari
          },
        },
        input: {
          padding: "14px 16px",
          "@media (max-width:600px)": {
            padding: "16px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: "14px 16px",
          "@media (max-width:600px)": {
            padding: "16px",
            fontSize: "16px", // Prevents zoom on mobile Safari
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            "& .MuiInputLabel-root": {
              fontSize: "0.9375rem",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: "32px",
          fontSize: "0.8125rem",
          "@media (max-width:600px)": {
            height: "36px",
            fontSize: "0.875rem",
            borderRadius: 6,
          },
        },
        sizeSmall: {
          height: "28px",
          fontSize: "0.75rem",
          "@media (max-width:600px)": {
            height: "32px",
            fontSize: "0.8125rem",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          minHeight: "48px",
          padding: "12px 16px",
          "@media (max-width:900px)": {
            fontSize: "0.8125rem",
            padding: "10px 12px",
          },
          "@media (max-width:600px)": {
            fontSize: "0.75rem",
            padding: "8px 8px",
            minWidth: "80px",
            minHeight: "52px", // Larger touch target
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            "& .MuiTab-root": {
              minWidth: "auto",
              flexShrink: 1,
            },
          },
        },
        scrollButtons: {
          "@media (max-width:600px)": {
            width: "40px",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px",
          borderBottom: "1px solid #F0F0F0",
          "@media (max-width:900px)": {
            padding: "12px 8px",
            fontSize: "0.875rem",
          },
          "@media (max-width:600px)": {
            padding: "10px 6px",
            fontSize: "0.8125rem",
          },
        },
        head: {
          fontWeight: 600,
          color: "#424242",
          backgroundColor: "#FAFAFA",
          "@media (max-width:600px)": {
            fontSize: "0.75rem",
            padding: "12px 6px",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "@media (max-width:600px)": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          border: "none",
          "@media (max-width:600px)": {
            width: "85vw",
            maxWidth: "320px",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          minHeight: "48px",
          "&.Mui-selected": {
            backgroundColor: "rgba(27, 94, 32, 0.08)",
            color: "#1B5E20",
            "&:hover": {
              backgroundColor: "rgba(27, 94, 32, 0.12)",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          "@media (max-width:600px)": {
            minHeight: "52px", // Larger touch target
            margin: "2px 12px",
            borderRadius: 6,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "40px",
          "@media (max-width:600px)": {
            minWidth: "44px",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid",
          padding: "12px 16px",
          "&.MuiAlert-standardSuccess": {
            backgroundColor: "#E8F5E8",
            borderColor: "#4CAF50",
            color: "#1B5E20",
          },
          "&.MuiAlert-standardError": {
            backgroundColor: "#FFEBEE",
            borderColor: "#F44336",
            color: "#C62828",
          },
          "&.MuiAlert-standardWarning": {
            backgroundColor: "#FFF8E1",
            borderColor: "#FF9800",
            color: "#E65100",
          },
          "&.MuiAlert-standardInfo": {
            backgroundColor: "#E3F2FD",
            borderColor: "#2196F3",
            color: "#1565C0",
          },
          "@media (max-width:600px)": {
            borderRadius: 8,
            padding: "14px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          "@media (max-width:600px)": {
            margin: 16,
            width: "calc(100% - 32px)",
            maxHeight: "calc(100% - 32px)",
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "@media (max-width:600px)": {
            padding: "16px",
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          "@media (max-width:600px)": {
            padding: "12px 16px",
            flexDirection: "column-reverse",
            gap: "8px",
            "& .MuiButton-root": {
              width: "100%",
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            width: "56px",
            height: "56px",
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            left: "16px",
            right: "16px",
            bottom: "16px",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          borderRadius: 8,
          padding: "8px 12px",
          "@media (max-width:600px)": {
            fontSize: "0.8125rem",
            padding: "10px 14px",
          },
        },
      },
    },
    // Custom mobile-specific components
    MuiGrid: {
      styleOverrides: {
        container: {
          "@media (max-width:600px)": {
            "& .MuiGrid-item": {
              paddingLeft: "8px",
              paddingTop: "8px",
            },
          },
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            gap: "12px !important",
          },
        },
      },
    },
  },
});

export default theme;

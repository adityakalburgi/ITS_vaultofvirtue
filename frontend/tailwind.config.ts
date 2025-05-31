
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#21fa2c',
					foreground: '#000005'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				terminal: {
					green: '#21fa2c',
					black: '#000005',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'text-blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'glow': {
					'0%, 100%': { 
						textShadow: '0 0 5px #21fa2c, 0 0 10px #21fa2c, 0 0 15px #21fa2c'
					},
					'50%': { 
						textShadow: '0 0 10px #21fa2c, 0 0 20px #21fa2c, 0 0 30px #21fa2c'
					}
				},
				'matrix-fall': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(1000%)' }
				},
				'pulse-border': {
					'0%, 100%': { borderColor: 'rgba(33, 250, 44, 0.3)' },
					'50%': { borderColor: 'rgba(33, 250, 44, 0.8)' }
				},
				'glitch-horizontal': {
					'0%': { transform: 'translateX(-2px)' },
					'25%': { transform: 'translateX(2px)' },
					'50%': { transform: 'translateX(-2px)' },
					'75%': { transform: 'translateX(2px)' },
					'100%': { transform: 'translateX(0px)' }
				},
				'glitch-vertical': {
					'0%': { transform: 'translateY(-2px)' },
					'25%': { transform: 'translateY(2px)' },
					'50%': { transform: 'translateY(-2px)' },
					'75%': { transform: 'translateY(2px)' },
					'100%': { transform: 'translateY(0px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'text-blink': 'text-blink 1s linear infinite',
				'glow': 'glow 1.5s ease-in-out infinite',
				'matrix-fall': 'matrix-fall 5s linear infinite',
				'pulse-border': 'pulse-border 2s ease-in-out infinite',
				'glitch-h': 'glitch-horizontal 0.2s ease-in-out',
				'glitch-v': 'glitch-vertical 0.2s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

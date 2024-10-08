#Export black gam



library(mgcv)
library(tidyverse)
library(jsonlite)

n_total <- 24 + 68 #Total N in Black et al. 2018

#Black et al digitized data
df <- read_csv("black_data_all.csv", show_col_types = FALSE) %>%
  #Speed in m/s, Cr in J/kg/m
  mutate(speed_m_s = speed_kmh/3.6,
         energy_j_kg_m = energy_kcal_kg_km*4.184,
         category = factor(category, 
                           levels = c("recreational", "elite"))
  ) %>%
  #SD is average of +/-1 sd
  mutate(st_dev = 0.5*(energy_kcal_kg_km - sd_lower) + 0.5*(sd_upper - energy_kcal_kg_km),
         st_dev_joules = st_dev*4.184) %>%
  #Weights should be (1/variance) * (n_group / n_total), SD squared is variance 
  mutate(reg_weight = 1/(st_dev_joules**2)*n_group*n_total) %>%
  #normalize weights
  mutate(reg_weight = reg_weight/sum(reg_weight)) %>%
  #Energetic cost
  mutate(w_kg = energy_j_kg_m*speed_m_s,
         sd_w_kg = st_dev_joules*speed_m_s)

#Fit a raw polynomial so we can port coefs
poly_fit <- lm(w_kg ~ speed_m_s + I(speed_m_s^2) + category, 
               weights = reg_weight, 
               data = df)

summary(poly_fit)


df_pred <- expand.grid(category = factor(c("recreational", "elite")),
                       speed_m_s = seq(1,6,by=0.01))

df_pred$yhat_black <- predict(poly_fit, newdata = df_pred)



df %>%
  ggplot(aes(x=speed_m_s, y=w_kg, color=category)) + 
  geom_point(size=2) + 
  geom_line(aes(y=yhat_black), data=df_pred) + 
  scale_color_brewer(palette = "Set1") + 
  theme_bw() + 
  theme(legend.position = "bottom")

coef(poly_fit)




# ---------  Plto for blgo post


fnt <- 12
fnt_ax <- 12
fnt_title <- 13

#Axis ticks
tick_wd <- 0.08
arrow_lwd <- 0.4
ant_fnt <- 3.5
ax_lwd <- 0.5


ax_x_fnt <- 10


col_1 <- "#377eb8"
col_2 <- "#e41a1c"

lwd <- 1.5
alf <- 0.1

ant_sz <- 5


# Unify theme
theme_mee <-   theme(plot.title = element_text(hjust=0.5, size = fnt_title),
                     axis.line = element_line(color="black", linewidth=ax_lwd,
                                              lineend = "square"),
                     axis.ticks = element_line(color="black", linewidth=ax_lwd,
                                               lineend = "square"),
                     axis.ticks.length = unit(tick_wd, "cm"),
                     axis.text = element_text(color = "black", size = fnt),
                     axis.title = element_text(color = "black", size = fnt_ax),
                     plot.background = element_rect(fill="white", color="white"),
                     panel.grid = element_line(linewidth=0.25),
                     plot.caption = element_text(size = fnt, face = "bold"))





pt_sz <- 3
lwd_er <- 1.5
lwd_poly <- 1.5
alf_poly <- 0.5

jit_x <- 0.002
jit_seed <- 12345


#Pace breaks

mi_breaks <-c(12,10,8,7,6,5.5,5)
pace_breaks_mi <- 1/(mi_breaks*60/1609.344) #This is in m/s
mi_labs <- sprintf("%d:%02.0f", floor(mi_breaks), 60*(mi_breaks - floor(mi_breaks)))

x_limits <- c(1.9,5.5)
x_breaks <- pace_breaks_mi

y_limits <- c(7,28)
y_breaks <- seq(10,25,by=5)


leg_lwd <- 0.25


#Filter to amke axes lok nices
df_pred_plot <- df_pred %>% 
  filter(speed_m_s >= 2.1,
         speed_m_s <= 5.37) %>%
  mutate(cat_cap = ifelse(category == "recreational", "Recreational", "Elite"),
         cat_cap = factor(cat_cap, levels = c("Recreational", "Elite")))



poly_plot <- df %>%
  mutate(cat_cap = ifelse(category == "recreational", "Recreational", "Elite"),
         cat_cap = factor(cat_cap, levels = c("Recreational", "Elite"))) %>%
  ggplot(aes(x=speed_m_s, y=w_kg, color=cat_cap)) +
  geom_linerange(aes(ymin=w_kg-sd_w_kg, ymax=w_kg+sd_w_kg),
                 position = position_jitter(width=jit_x, height=0,seed=jit_seed),
                 linewidth = lwd_er) + 
  geom_point(size=pt_sz,
             pch = 16,
             position = position_jitter(width=jit_x, height=0,seed=jit_seed)) + 
  #Polynomial lines
  geom_line(aes(y=yhat_black), data=df_pred_plot,
            linewidth = lwd_poly, alpha = alf_poly) + 
  #Scales
  scale_color_brewer(palette = "Set1") + 
  guides(x = guide_axis(cap = "both"),
         y = guide_axis(cap = "both")) +
  scale_x_continuous(breaks = x_breaks, limits = x_limits,
                     name = "Running pace (min/mi)",
                     labels = mi_labs,
                     expand = c(0,0)) + 
  scale_y_continuous(breaks = y_breaks, limits = y_limits, 
                     name = "Metabolic cost (W/kg)",
                     expand = c(0,0)) + 
  ggtitle("The metabolic cost of running rises in a non-linear fashion",
          "Data from Black et al. 2018") + 
  labs(caption = "RunningWritings.com") + 
  theme_minimal() + 
  #theme_bw() + 
  theme_mee +
  theme(legend.position = "inside", 
        legend.position.inside = c(0.2,0.8),
        legend.background = element_rect(fill="white", color="black", linewidth = leg_lwd),
        legend.title = element_blank(),
        panel.grid.minor = element_blank(),
        panel.grid.major = element_blank(),
        plot.margin = unit(c(0.25, 0.25, 0.25, 0.5), "cm"),
        plot.subtitle = element_text(hjust=0.5),
        plot.caption.position = "plot",
        legend.text=element_text(size=fnt)) 



poly_plot


ggsave("09 - Metabolic cost of running - from Black et al.png",
       poly_plot, width = 2048, height = 1536, units="px")




# --------



# --- Kipchoge predictions

df_kipchoge <- data.frame(speed_m_s = seq(2,6,by=0.01), category = factor("elite"))
df_kipchoge$w_kg_black <- predict(poly_fit, newdata = df_kipchoge)


# --- Compare with Kipp data

#This constant is from 0.00354*Ap and they use Kipchoge
#58 kg and height = 1.71 m and Ap of 0.45

kipp_fn <- function(v) 1.7321*v^2 - 0.4538*v + 18.91 + 0.02724*v^3
kipp_tread_fn <- function(v) 1.7321*v^2 - 0.4538*v + 18.91
black_tread_fn <- function(v) 1.9128*v^2 - 3.2483*v + 25.806


#Calculated F_drag
Ap <-  0.45
bw_kg <- 58
bw_n <- bw_kg*9.8065 
air_density <- 1.225
Cd <- 0.9 #Drag coefficient

get_fdrag <- function(v) 0.5*air_density*v^2*Cd*Ap



#Given energetic expenditure and an RER

# energy in kJ 


# Use brockport constants to convert RER and EE in W/kg to VO2 in mL/kg/min

get_vo2 <- function(ee_w_kg, rer = 1.0){
  #Constants from Brockport 19XX
  fat_rq <- 0.7145
  fat_kj_l <- 19.8071
  carb_rq <- 1.00
  carb_kj_l <- 21.0956
  
  #Convert energt expenditure from W/kg to kJ/min
  ee_kj_min <- ee_w_kg*60/1000 
  
  #Get energy per L of O2 for this RER
  energy_per_l_o2 <- fat_kj_l+(carb_kj_l - fat_kj_l)*(rer-fat_rq)/(carb_rq - fat_rq)
  
  #Convert to VO2 in mL/kg/min
  vo2 <- ee_kj_min/energy_per_l_o2*1000
}


df_rer <- expand_grid(rer = seq(0.85,1.0,by=0.05),
                      speed_m_s = seq(2,6, by=0.01),
                      category = factor("elite"))

df_rer$ee_w_kg <- predict(poly_fit, newdata = df_rer)
df_rer$vo2_black <- get_vo2(df_rer$ee_w_kg, rer = df_rer$rer)

# Add kipp predictions

df_kipp <- data.frame(speed_m_s = seq(2,6,by=0.01))
df_kipp$vo2_tread <- kipp_tread_fn(df_kipp$speed_m_s)
df_kipp$vo2_air <- kipp_fn(df_kipp$speed_m_s)


# -- Plot Kipp
df_kipp %>%
  ggplot(aes(x=speed_m_s, y=vo2_tread)) +
  geom_ribbon(aes(ymin = vo2_tread, ymax = vo2_air), fill="navy", alpha = 0.2) + 
  geom_line(color = "navy", linewidth=1) + 
  geom_line(aes(y=vo2_air), color="blue", linewidth=1)




df_vo2 <- df %>%
  mutate(pred_vo2 = get_vo2(w_kg, rer=0.95))



library(viridis)

df_rer %>%
  ggplot(aes(x=speed_m_s, y=vo2_black, color = rer, group=rer)) + 
  geom_line(linewidth=1.5) + 
  geom_line(aes(x=speed_m_s, y=vo2_tread),inherit.aes=FALSE, data = df_kipp,
            color = "red", linewidth=1) + 
  scale_color_viridis(option = "mako", limits = c(0.8,1.05))



#Kipchoge - predict

df_kipchoge$vo2_kipp_tread <- kipp_tread_fn(df_kipchoge$speed_m_s)
df_kipchoge$vo2_kipp_air <- kipp_fn(df_kipchoge$speed_m_s)
df_kipchoge$vo2_black <- get_vo2(df_kipchoge$w_kg_black, rer=0.95)
df_kipchoge$vo2_black_kipp <- black_tread_fn(df_kipchoge$speed_m_s)






#Is my queawoitn working? _ YES, small differnces in data fit make big differnce with extrapolation

df_kipchoge %>%
  ggplot(aes(x=speed_m_s, y=vo2_black)) +
  geom_line(color = "navy", linewidth=1.5) + 
  geom_line(aes(y=vo2_black_kipp), color="red", linewidth=1.5) + 
  geom_point(aes(y=pred_vo2), data = df_vo2, size=2)




df_kipchoge %>%
  ggplot(aes(x=speed_m_s, y=vo2_kipp_tread)) +
  geom_line(color = "navy", linewidth=1) + 
  geom_line(aes(y=vo2_kipp_air), color="blue", linewidth=1)+
  geom_line(aes(y=vo2_black), color="red", linewidth=1)



























#Brockport

RER <- 0.85
fat_RQ <- 0.7145
fat_kj_l <- 19.8071
carb_RQ <- 1.00
carb_kj_l <- 21.0956

pct_carbs <- (RER - fat_RQ)/(1-fat_RQ)
pct_fat <- 1 - pct_carbs

pct_carbs
pct_fat


energy_kj <- 21.0956+19.8071









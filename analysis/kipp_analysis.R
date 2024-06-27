#Export black gam



# TODO:

# Think I will go with the black polynomial since it does ake sense to assume curvature otusdie range of data
# Need to cehck Vo2 covnersion against Brockwell equation - assume RER of like...0.9? 
#Or wahtever is typical for amrathon, not super important I hink

#Thens tart impelmenting in JS


# OK SO current todo is basically

# Make anotehr plto shwoing black but with no air resitance added from drag eqn

#Compare black with pugh to black with drag eqn

#Can repro the Kipp paper with Kipchoge's data and the 0.45 Ap

#Go back to js and re-implement? hmmmm barin now orky


#Just to cehck it against their reuslst

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
  mutate(reg_weight = reg_weight/sum(reg_weight))


# -- Fit gam
wt_mod <- gam(energy_j_kg_m ~ s(speed_m_s, bs="cr", k=4) + category,
              data = df,
              weights = reg_weight)
summary(wt_mod)
plot(wt_mod)


# Functions from Kipp 2019


#This constant is from 0.00354*Ap and they use Kipchoge
#58 kg and height = 1.71 m and Ap of 0.45


#Leger and Mercier 1984
LM_fn <- function(v) 11.39*v + 2.209 + 0.02724*v^3
#Returns VO2 in ml/kg/min

batliner_fn <- function(v) 1.5355*v^2 + 1.5374*v + 15.661 + 0.02724*v^3

black_fn <- function(v) 1.9128*v^2 - 3.2483*v + 25.806 + 0.02724*v^3
black_tread_fn <- function(v) 1.9128*v^2 - 3.2483*v + 25.806
#no air resistance term

kipp_fn <- function(v) 1.7321*v^2 - 0.4538*v + 18.91 + 0.02724*v^3
kipp_tread_fn <- function(v) 1.7321*v^2 - 0.4538*v + 18.91


# Ok so, if we want to know metabolic cost of running in calm air..

v_vec <- seq(2,6, length.out = 101)


df_pred <- data.frame(speed_m_s = v_vec,
                      category = factor("elite"))

df_pred$cr_hat <- predict(wt_mod, newdata = df_pred, type="response") %>% as.vector()
df_pred$wkg_hat <- df_pred$cr_hat*df_pred$speed_m_s

#This is metabolic cost on treadmill
df_pred %>%
  ggplot(aes(x=speed_m_s, y=wkg_hat)) + 
  geom_line()

#Now need to know how much to add. get Fdrag


Ap <-  0.45
bw_kg <- 58
bw_n <- bw_kg*9.8065 
air_density <- 1.225
Cd <- 0.9 #Drag coefficient

get_fdrag <- function(v) 0.5*air_density*v^2*Cd*Ap
#Returns force in Newtons


#Use Da Silva euqations to get actual drag forces
df_pred$F_drag_N <- get_fdrag(df_pred$speed_m_s)
df_pred$F_drag_BW_pct <- df_pred$F_drag_N/bw_n*100
df_pred$delta_Wkg_pct <- 6.13*df_pred$F_drag_BW_pct

#Overground
df_pred$overground_Wkg <- df_pred$wkg_hat*(1 + df_pred$delta_Wkg_pct/100)


df_pred %>%
  ggplot(aes(x=speed_m_s, y=wkg_hat)) + 
  geom_line(color="navy")+
  geom_line(aes(y=overground_Wkg), color = "blue")

#Convert to VO2

#TODO: fix and make not approxiamte!


df_pred$gam_vo2_tread_eq <- df_pred$wkg_hat*60/20.075 #CHECK /FIX!!
df_pred$vo2_drag_eq <- df_pred$overground_Wkg*60/20.075 #CHECK /FIX!!



#Drop in various formulas
df_pred$vo2_LM_hat <- LM_fn(df_pred$speed_m_s)
df_pred$vo2_batliner_hat <- batliner_fn(df_pred$speed_m_s)
df_pred$vo2_black_hat <- black_fn(df_pred$speed_m_s)
df_pred$vo2_kipp_hat <- kipp_fn(df_pred$speed_m_s)
df_pred$vo2_kipp_tread_hat <- kipp_tread_fn(df_pred$speed_m_s)
df_pred %>% glimpse()


df_pred %>%
  ggplot(aes(x=speed_m_s, y=vo2_kipp_tread_hat)) + 
  geom_line(color = "navy", linewidth=1) + 
  geom_line(aes(y=vo2_kipp_hat), color = "blue", linewidth=1) +
  geom_line(aes(y=vo2_drag_eq), color = "red", linewidth=1) 



df_pred %>%
  ggplot(aes(x=speed_m_s, y=gam_vo2_tread_eq)) + 
  geom_line(color = "navy", linewidth=1) +
  # geom_line(aes(y=vo2_drag_eq), color = "blue", linewidth=1)  +
  geom_line(aes(y=vo2_kipp_tread_hat), color = "darkred", linewidth=1) 
  # geom_line(aes(y=vo2_kipp_hat), color = "red", linewidth=1) 





# All plot
df_new <- df_pred %>%
  pivot_longer(starts_with("vo2"),
               names_to = "calc_method",
               names_prefix = "vo2_",
               values_to = "vo2")




col_v <- c("gray","gray","red","gray","gray")

df_new %>%
  ggplot(aes(x=speed_m_s, y=vo2, color = calc_method)) + 
  geom_line(linewidth = 2, alpha = 0.5) + 
  #scale_color_brewer(palette = "Set1") +
  scale_color_manual(values = col_v) + 
  theme_bw()



















# --- Grid for data analysis in javascript ---
#Can make bigger later if needed
ng_java <- 201
java_df <- data.frame(speed_m_s = seq(0,10, length.out = ng_java),
                      category = factor("elite"))

#Foollowing 
#https://stats.stackexchange.com/questions/406566
#I don't really see how this is different from predict.gam() but whatever

lp_mat <- predict(wt_mod, newdata = java_df, type="lpmatrix")
beta_coef <- coef(wt_mod)
pred_mat <- lp_mat %*% beta_coef

export_df <- data.frame(speed_m_s = java_df$speed_m_s,
                        energy_j_kg_m = pred_mat,
                        energy_j_kg_s = pred_mat*java_df$speed_m_s)

json_data <- toJSON(export_df, pretty = TRUE, dataframe = 'columns')

# Write the JSON to a file
write(json_data, "black_data_gam.json")

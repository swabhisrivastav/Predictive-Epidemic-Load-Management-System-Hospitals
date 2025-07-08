import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings

warnings.filterwarnings('ignore')

# ML Libraries
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, classification_report, confusion_matrix
import joblib

# Time series libraries
try:
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.seasonal import seasonal_decompose

    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    print("Warning: statsmodels not available. ARIMA models will be skipped.")


class EnhancedOverloadRiskAssessment:

    def __init__(self, base_capacity):
        self.base_capacity = base_capacity

        # Risk thresholds (as percentages of capacity)
        self.risk_thresholds = {
            'low': 0.70,  # < 70% capacity
            'medium': 0.85,  # 70-85% capacity
            'high': 0.95,  # 85-95% capacity
            'critical': 1.0  # > 95% capacity
        }

        # Surge capacity factors (how much we can stretch resources)
        self.surge_factors = {
            'icu_beds': 1.2,  # Can add 20% more ICU beds temporarily
            'ventilators': 1.1,  # Can add 10% more ventilators
            'oxygen_cylinders': 1.3,  # Can add 30% more oxygen
            'total_beds': 1.15  # Can add 15% more regular beds
        }

    def calculate_resource_utilization(self, predicted_needs, include_surge=False):
        """
        Calculate utilization percentage for each resource
        """
        capacity = self.base_capacity.copy()

        if include_surge:
            for resource, factor in self.surge_factors.items():
                if resource in capacity:
                    capacity[resource] = int(capacity[resource] * factor)

        utilization = {}

        # ICU beds utilization
        if 'predicted_icu_beds_needed' in predicted_needs:
            utilization['icu_beds'] = predicted_needs['predicted_icu_beds_needed'] / capacity['icu_beds']

        # Ventilators utilization
        if 'predicted_ventilators_needed' in predicted_needs:
            utilization['ventilators'] = predicted_needs['predicted_ventilators_needed'] / capacity['ventilators']

        # Oxygen cylinders utilization
        if 'predicted_oxygen_cylinders_needed' in predicted_needs:
            utilization['oxygen_cylinders'] = predicted_needs['predicted_oxygen_cylinders_needed'] / capacity[
                'oxygen_cylinders']

        # Total beds utilization (estimate based on admissions)
        if 'predicted_total_admissions' in predicted_needs:
            # Assume average stay of 5 days for bed occupancy estimation
            estimated_bed_occupancy = predicted_needs['predicted_total_admissions'] * 5
            utilization['total_beds'] = estimated_bed_occupancy / capacity['total_beds']

        return utilization

    def determine_overload_risk(self, predicted_needs, day_ahead=1):
        """
        Determine overload risk based on resource utilization and additional factors
        """
        # Calculate base utilization
        utilization = self.calculate_resource_utilization(predicted_needs)

        # Calculate surge utilization (what we can handle in emergency)
        surge_utilization = self.calculate_resource_utilization(predicted_needs, include_surge=True)

        # Find the maximum utilization across all resources
        max_utilization = max(utilization.values()) if utilization else 0
        max_surge_utilization = max(surge_utilization.values()) if surge_utilization else 0

        # Base risk assessment
        if max_surge_utilization > 1.0:
            base_risk = 'Critical'
        elif max_utilization > self.risk_thresholds['high']:
            base_risk = 'High'
        elif max_utilization > self.risk_thresholds['medium']:
            base_risk = 'Medium'
        else:
            base_risk = 'Low'

        # Risk escalation factors
        escalation_factors = []

        # Multiple resource strain
        high_util_resources = sum(1 for util in utilization.values() if util > self.risk_thresholds['medium'])
        if high_util_resources >= 2:
            escalation_factors.append('multiple_resource_strain')

        # Trend factor (if this is day 3+ of predictions, assume escalating trend)
        if day_ahead >= 3:
            escalation_factors.append('sustained_demand')

        # Weekend factor (fewer staff available)
        if 'day_of_week' in predicted_needs and predicted_needs['day_of_week'] in [5, 6]:  # Saturday, Sunday
            escalation_factors.append('weekend_staffing')

        # Apply escalation
        if escalation_factors:
            if base_risk == 'Low' and len(escalation_factors) >= 2:
                final_risk = 'Medium'
            elif base_risk == 'Medium' and len(escalation_factors) >= 1:
                final_risk = 'High'
            elif base_risk == 'High':
                final_risk = 'Critical'
            else:
                final_risk = base_risk
        else:
            final_risk = base_risk

        # Create detailed risk assessment
        risk_details = {
            'overall_risk': final_risk,
            'base_risk': base_risk,
            'max_utilization': max_utilization,
            'max_surge_utilization': max_surge_utilization,
            'resource_utilization': utilization,
            'surge_utilization': surge_utilization,
            'escalation_factors': escalation_factors,
            'bottleneck_resources': [k for k, v in utilization.items() if v > self.risk_thresholds['medium']]
        }

        return risk_details

    def generate_risk_probabilities(self, risk_details):
        """
        Generate risk probabilities based on deterministic assessment
        """
        risk = risk_details['overall_risk']

        if risk == 'Critical':
            return {'Low': 0.0, 'Medium': 0.1, 'High': 0.2, 'Critical': 0.7}
        elif risk == 'High':
            return {'Low': 0.1, 'Medium': 0.2, 'High': 0.6, 'Critical': 0.1}
        elif risk == 'Medium':
            return {'Low': 0.2, 'Medium': 0.6, 'High': 0.2, 'Critical': 0.0}
        else:  # Low
            return {'Low': 0.8, 'Medium': 0.2, 'High': 0.0, 'Critical': 0.0}


class EpidemicMLPredictor:
    """
    Machine Learning system for epidemic hospital load prediction
    """

    def __init__(self):
        self.admission_model = None
        self.resource_models = {}
        self.overload_classifier = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()

        # Prediction horizons
        self.prediction_horizons = {
            'short_term': 3,  # 3 days
            'medium_term': 7,  # 1 week
            'long_term': 14  # 2 weeks
        }

    def create_time_features(self, df):
        df = df.copy()
        df['date'] = pd.to_datetime(df['date'])

        # ➕ Compute bed utilization %
        if 'total_occupancy' in df.columns and 'total_beds' in df.columns:
            df['bed_utilization_percent'] = (df['total_occupancy'] / df['total_beds']) * 100
        else:
            df['bed_utilization_percent'] = 0  # fallback if not present

        # Time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
        df['is_month_end'] = df['date'].dt.is_month_end.astype(int)

        # Lag features
        for lag in [1, 3, 7, 14]:
            df[f'admissions_lag_{lag}'] = df['total_admissions'].shift(lag)
            df[f'covid_admissions_lag_{lag}'] = df['covid_admissions'].shift(lag)
            df[f'bed_util_lag_{lag}'] = df['bed_utilization_percent'].shift(lag)

        # Rolling averages
        for window in [3, 7, 14]:
            df[f'admissions_rolling_{window}'] = df['total_admissions'].rolling(window=window).mean()
            df[f'covid_rolling_{window}'] = df['covid_admissions'].rolling(window=window).mean()
            df[f'bed_util_rolling_{window}'] = df['bed_utilization_percent'].rolling(window=window).mean()

        # Trend features
        df['admissions_trend_7d'] = df['total_admissions'] - df['admissions_rolling_7']
        df['covid_trend_7d'] = df['covid_admissions'] - df['covid_rolling_7']

        return df

    def prepare_prediction_data(self, df):
        """
        Prepare data for ML models by handling missing values and feature engineering
        """
        df_features = self.create_time_features(df)

        # Forward fill missing values for lag features
        df_features = df_features.fillna(method='ffill').fillna(0)

        # Select feature columns (exclude target variables and identifiers)
        feature_cols = [col for col in df_features.columns if col not in [
            'date', 'total_admissions', 'covid_admissions', 'regular_admissions',
            'total_occupancy', 'icu_occupancy', 'ventilator_use', 'oxygen_use',
            'overload_risk'
        ]]

        return df_features, feature_cols

    def train_admission_prediction_model(self, df):
        """
        Train ML model to predict COVID admissions
        """
        print("Training COVID admission prediction model...")

        df_features, feature_cols = self.prepare_prediction_data(df)

        self.last_used_feature_cols = feature_cols

        # Prepare features and targets
        X = df_features[feature_cols].values
        y_total = df_features['total_admissions'].values
        y_covid = df_features['covid_admissions'].values

        # Split data (time series split - use earlier data for training)
        split_point = int(len(X) * 0.8)
        X_train, X_test = X[:split_point], X[split_point:]
        y_covid_train, y_covid_test = y_covid[:split_point], y_covid[split_point:]

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train Random Forest model
        self.admission_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            min_samples_split=5
        )

        self.admission_model.fit(X_train_scaled, y_covid_train)

        # Evaluate
        y_pred = self.admission_model.predict(X_test_scaled)
        mae = mean_absolute_error(y_covid_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_covid_test, y_pred))

        print(f"COVID Admission Prediction - MAE: {mae:.2f}, RMSE: {rmse:.2f}")

        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': self.admission_model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("Top 10 Important Features for COVID Admission Prediction:")
        print(feature_importance.head(10))

        return feature_cols

    def train_resource_prediction_models(self, df, feature_cols):
        """
        Train models to predict resource requirements based on admissions
        """
        print("\nTraining resource prediction models...")

        df_features, _ = self.prepare_prediction_data(df)

        # Resource targets
        resource_targets = {
            'icu_beds': 'icu_occupancy',
            'ventilators': 'ventilator_use',
            'oxygen_cylinders': 'oxygen_use'
        }

        X = df_features[feature_cols].values
        split_point = int(len(X) * 0.8)
        X_train, X_test = X[:split_point], X[split_point:]
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        for resource_name, target_col in resource_targets.items():
            print(f"Training {resource_name} prediction model...")

            # Prepare target
            y = df_features[target_col].values
            y_train, y_test = y[:split_point], y[split_point:]

            # Train model
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=8,
                random_state=42
            )

            model.fit(X_train_scaled, y_train)
            self.resource_models[resource_name] = model

            # Evaluate
            y_pred = model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred)
            print(f"  {resource_name} - MAE: {mae:.2f}")

    def predict_future_admissions(self, df, days_ahead=7):
        """
        Predict future COVID admissions
        """
        if self.admission_model is None:
            raise ValueError("Admission model not trained yet!")

        # Get the last few rows for feature creation
        recent_data = df.tail(30).copy()  # Use last 30 days for context

        predictions = []
        current_df = recent_data.copy()

        for day in range(days_ahead):
            # Create features for the current state
            df_features, feature_cols = self.prepare_prediction_data(current_df)

            # Get the latest features
            latest_features = df_features[feature_cols].iloc[-1:].values
            latest_features_scaled = self.scaler.transform(latest_features)

            # Predict
            covid_admission_pred = self.admission_model.predict(latest_features_scaled)[0]
            covid_admission_pred = max(0, int(covid_admission_pred))  # Ensure non-negative

            # Create next day's data point
            last_date = pd.to_datetime(current_df['date'].iloc[-1])
            next_date = last_date + timedelta(days=1)

            # Estimate regular admissions (assuming some baseline)
            regular_admissions = int(np.mean(df['regular_admissions'].tail(14)))
            total_admissions = covid_admission_pred + regular_admissions

            # Add predicted day to dataframe for next iteration
            next_row = current_df.iloc[-1].copy()
            next_row['date'] = next_date.strftime('%Y-%m-%d')
            next_row['covid_admissions'] = covid_admission_pred
            next_row['regular_admissions'] = regular_admissions
            next_row['total_admissions'] = total_admissions

            # Append to current dataframe
            current_df = pd.concat([current_df, pd.DataFrame([next_row])], ignore_index=True)

            predictions.append({
                'date': next_date.strftime('%Y-%m-%d'),
                'predicted_covid_admissions': covid_admission_pred,
                'predicted_total_admissions': total_admissions,
                'day_ahead': day + 1
            })

        return pd.DataFrame(predictions)

    def predict_resource_requirements(self, admission_predictions, base_capacity):
        """
        Predict resource requirements based on admission predictions
        """
        resource_predictions = []

        for _, row in admission_predictions.iterrows():
            covid_admissions = row['predicted_covid_admissions']
            total_admissions = row['predicted_total_admissions']

            # Prepare temporary dataframe with required basic fields
            df_temp = pd.DataFrame([{
                'date': row['date'],
                'covid_admissions': covid_admissions,
                'total_admissions': total_admissions,
                'regular_admissions': total_admissions - covid_admissions,
                'icu_occupancy': 0,  # Placeholder
                'ventilator_use': 0,  # Placeholder
                'oxygen_use': 0,  # Placeholder
                'overload_risk': 'Low'  # Placeholder
            }])

            # Generate features from this single-day temp data
            df_features_full, _ = self.prepare_prediction_data(df_temp)

            # Ensure consistent feature set
            if hasattr(self.scaler, 'feature_names_in_'):
                expected_features = list(self.scaler.feature_names_in_)
            else:
                expected_features = self.last_used_feature_cols

            # Add missing columns with 0 and reorder
            for col in expected_features:
                if col not in df_features_full.columns:
                    df_features_full[col] = 0
            df_features_full = df_features_full[expected_features]

            latest_features_scaled = self.scaler.transform(df_features_full.iloc[-1:].values)

            # Predict each resource
            predicted_resources = {}
            for resource_name, model in self.resource_models.items():
                prediction = model.predict(latest_features_scaled)[0]
                predicted_resources[f'predicted_{resource_name}_needed'] = max(0, int(round(prediction)))

            # Calculate adequacy
            predicted_resources['icu_adequacy'] = (
                    base_capacity['icu_beds'] - predicted_resources['predicted_icu_beds_needed']
            )
            predicted_resources['ventilator_adequacy'] = (
                    base_capacity['ventilators'] - predicted_resources['predicted_ventilators_needed']
            )
            predicted_resources['oxygen_adequacy'] = (
                    base_capacity['oxygen_cylinders'] - predicted_resources['predicted_oxygen_cylinders_needed']
            )

            # Append prediction row
            resource_predictions.append({
                'date': row['date'],
                'day_ahead': row['day_ahead'],
                **predicted_resources
            })

        return pd.DataFrame(resource_predictions)

    def predict_overload_risk_enhanced(self, admission_predictions, base_capacity):
        """
        Enhanced overload risk prediction using rule-based logic instead of ML classifier
        """
        # Initialize the enhanced risk assessor
        risk_assessor = EnhancedOverloadRiskAssessment(base_capacity)

        risk_predictions = []

        for _, row in admission_predictions.iterrows():
            # Prepare data for risk assessment
            prediction_data = {
                'predicted_covid_admissions': row['predicted_covid_admissions'],
                'predicted_total_admissions': row['predicted_total_admissions'],
                'day_ahead': row['day_ahead'],
                'day_of_week': datetime.strptime(row['date'], '%Y-%m-%d').weekday()
            }

            # Estimate resource needs based on COVID admissions
            # These ratios should be calibrated based on your hospital's data
            covid_cases = row['predicted_covid_admissions']

            # Typical ratios for COVID patients (more aggressive for demonstration)
            prediction_data['predicted_icu_beds_needed'] = max(1, int(covid_cases * 0.45))  # 45% need ICU
            prediction_data['predicted_ventilators_needed'] = max(1, int(covid_cases * 0.30))  # 30% need ventilators
            prediction_data['predicted_oxygen_cylinders_needed'] = max(1, int(covid_cases * 0.85))  # 85% need oxygen

            # Assess risk using enhanced logic
            risk_details = risk_assessor.determine_overload_risk(prediction_data, day_ahead=row['day_ahead'])
            risk_probs = risk_assessor.generate_risk_probabilities(risk_details)

            risk_predictions.append({
                'date': row['date'],
                'day_ahead': row['day_ahead'],
                'predicted_overload_risk': risk_details['overall_risk'],
                'base_risk_assessment': risk_details['base_risk'],
                'max_utilization_percent': risk_details['max_utilization'] * 100,
                'bottleneck_resources': ', '.join(risk_details['bottleneck_resources']),
                'escalation_factors': ', '.join(risk_details['escalation_factors']),
                'risk_probabilities': risk_probs,
                'can_handle_with_surge': risk_details['max_surge_utilization'] <= 1.0
            })

        return pd.DataFrame(risk_predictions)

    def generate_comprehensive_forecast_enhanced(self, df, base_capacity, days_ahead=7):
        """
        Enhanced comprehensive forecast with rule-based overload risk assessment
        """
        print(f"\nGenerating {days_ahead}-day enhanced comprehensive forecast...")

        # 1. Predict admissions
        admission_forecast = self.predict_future_admissions(df, days_ahead)

        # 2. Predict resource requirements
        resource_forecast = self.predict_resource_requirements(admission_forecast, base_capacity)

        # 3. Enhanced overload risk prediction (rule-based)
        risk_forecast = self.predict_overload_risk_enhanced(admission_forecast, base_capacity)

        # Combine all forecasts
        comprehensive_forecast = admission_forecast.merge(
            resource_forecast, on=['date', 'day_ahead']
        ).merge(
            risk_forecast, on=['date', 'day_ahead']
        )

        return comprehensive_forecast

    def save_models(self, filepath_prefix='epidemic_ml_models'):
        """Save trained models"""
        joblib.dump(self.admission_model, f'{filepath_prefix}_admission_model.pkl')
        joblib.dump(self.resource_models, f'{filepath_prefix}_resource_models.pkl')
        joblib.dump(self.scaler, f'{filepath_prefix}_scaler.pkl')
        if hasattr(self, 'last_used_feature_cols'):
            joblib.dump(self.last_used_feature_cols, f'{filepath_prefix}_feature_cols.pkl')
        print(f"Models saved with prefix: {filepath_prefix}")

    def load_models(self, filepath_prefix='epidemic_ml_models'):
        """Load trained models"""
        self.admission_model = joblib.load(f'{filepath_prefix}_admission_model.pkl')
        self.resource_models = joblib.load(f'{filepath_prefix}_resource_models.pkl')
        self.scaler = joblib.load(f'{filepath_prefix}_scaler.pkl')
        if hasattr(self, 'last_used_feature_cols'):
            self.last_used_feature_cols = joblib.load(f'{filepath_prefix}_feature_cols.pkl')
        print(f"Models loaded from prefix: {filepath_prefix}")


def create_high_stress_scenario(base_df, start_date='2023-01-01', days=14):
    """
    Create a high-stress scenario for demonstration
    """
    # Create escalating COVID cases
    dates = pd.date_range(start=start_date, periods=days, freq='D')

    # Simulate a surge scenario
    scenario_data = []
    base_covid = 18  # Start with higher base

    for i, date in enumerate(dates):
        # Exponential growth for first week, then plateau
        if i < 7:
            covid_cases = base_covid + (i * 4)  # Rapid increase
        else:
            covid_cases = base_covid + 28 + np.random.randint(-3, 4)  # Plateau with noise

        # Add weekend surge (people delay hospital visits)
        if date.weekday() in [0, 1]:  # Monday, Tuesday (weekend spillover)
            covid_cases += 6

        scenario_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'predicted_covid_admissions': covid_cases,
            'predicted_total_admissions': covid_cases + 8,  # Regular admissions
            'day_ahead': i + 1,
            'day_of_week': date.weekday()
        })

    return pd.DataFrame(scenario_data)


def main_enhanced_ml_pipeline():
    """
    Main function with enhanced overload risk assessment
    """
    print("=== ENHANCED EPIDEMIC ML PREDICTION SYSTEM ===\n")

    # Initialize the ML system
    predictor = EpidemicMLPredictor()

    # Load hospital data
    try:
        df = pd.read_csv('hospital_admissions_2020_2022.csv')
        print(f"\nLoaded {len(df)} records of hospital data")
    except FileNotFoundError:
        print("Error: Please run the hospital data generator first")
        return

    # Hospital capacity
    base_capacity = {
        'total_beds': 150,
        'icu_beds': 25,
        'ventilators': 15,
        'oxygen_cylinders': 50,
        'doctors': 12,
        'nurses': 35,
        'icu_nurses': 8
    }

    print("\n=== TRAINING ML MODELS ===")

    # Train models (admission and resource prediction only)
    feature_cols = predictor.train_admission_prediction_model(df)
    predictor.train_resource_prediction_models(df, feature_cols)

    # Skip the overload classifier training - we'll use rule-based logic instead
    print("\n  Using enhanced rule-based overload risk assessment")

    # Generate enhanced forecasts
    print("\n=== GENERATING ENHANCED FORECASTS ===")

    #  challenging scenario for demonstration
    print("Creating challenging scenario with increased COVID cases...")

    # Modify the last few days to simulate a surge
    df_modified = df.copy()
    surge_multiplier = 3.0  # Increase recent COVID cases significantly

    # Apply surge to last 10 days
    df_modified.loc[df_modified.index[-10:], 'covid_admissions'] *= surge_multiplier
    df_modified.loc[df_modified.index[-10:], 'total_admissions'] = (
            df_modified.loc[df_modified.index[-10:], 'covid_admissions'] +
            df_modified.loc[df_modified.index[-10:], 'regular_admissions']
    )

    # Generate 14-day forecast with enhanced logic
    forecast = predictor.generate_comprehensive_forecast_enhanced(df_modified, base_capacity, days_ahead=14)

    print("\n14-Day Enhanced Forecast Summary:")
    display_cols = ['date', 'day_ahead', 'predicted_covid_admissions',
                    'predicted_icu_beds_needed', 'predicted_ventilators_needed',
                    'predicted_overload_risk', 'max_utilization_percent']

    print(forecast[display_cols].head(10))

    # Save forecast
    forecast.to_csv('enhanced_hospital_forecast_14_days.csv', index=False)
    print(f"\nEnhanced forecast saved to: enhanced_hospital_forecast_14_days.csv")

    # Enhanced analysis and recommendations
    print("\n=== ENHANCED RECOMMENDATIONS ===")

    # Risk distribution
    risk_distribution = forecast['predicted_overload_risk'].value_counts()
    print(f"\nRisk Level Distribution:")
    for risk_level, count in risk_distribution.items():
        percentage = (count / len(forecast)) * 100
        print(f"  {risk_level}: {count} days ({percentage:.1f}%)")

    # High-risk days analysis
    high_risk_days = forecast[forecast['predicted_overload_risk'].isin(['High', 'Critical'])]
    if len(high_risk_days) > 0:
        print(f"\nHIGH/CRITICAL RISK ALERT: {len(high_risk_days)} days with elevated risk!")
        print("\nHigh-Risk Days Details:")
        high_risk_summary = high_risk_days[['date', 'predicted_overload_risk', 'max_utilization_percent',
                                            'bottleneck_resources', 'escalation_factors']]
        print(high_risk_summary.to_string(index=False))
    else:
        print("✅ No high-risk days predicted")

    # Resource bottleneck analysis
    print(f"\n=== RESOURCE BOTTLENECK ANALYSIS ===")
    bottleneck_days = forecast[forecast['bottleneck_resources'] != '']
    if len(bottleneck_days) > 0:
        print(f"Days with resource bottlenecks: {len(bottleneck_days)}")
        bottleneck_summary = bottleneck_days.groupby('bottleneck_resources').size().sort_values(ascending=False)
        print("Most common bottlenecks:")
        print(bottleneck_summary.head())

    # Surge capacity analysis
    no_surge_days = forecast[forecast['can_handle_with_surge'] == False]
    if len(no_surge_days) > 0:
        print(f"\n CRITICAL: {len(no_surge_days)} days exceed even surge capacity!")
        print("Dates requiring external support:")
        print(no_surge_days[['date', 'predicted_overload_risk', 'max_utilization_percent']].to_string(index=False))

    # Actionable recommendations
    print(f"\n=== ACTIONABLE RECOMMENDATIONS ===")

    max_utilization = forecast['max_utilization_percent'].max()
    if max_utilization > 100:
        print(f"1. IMMEDIATE ACTION REQUIRED: Peak utilization reaches {max_utilization:.1f}%")
        print("   - Activate surge capacity protocols")
        print("   - Consider patient transfers to other facilities")
        print("   - Increase staffing levels")

    if len(high_risk_days) > 0:
        print(f"2. PREPARE FOR HIGH-RISK PERIOD: {high_risk_days['date'].min()} to {high_risk_days['date'].max()}")
        print("   - Pre-position additional resources")
        print("   - Brief staff on surge protocols")
        print("   - Coordinate with regional hospitals")

    critical_resources = forecast['bottleneck_resources'].value_counts()
    if len(critical_resources) > 0:
        print(f"3. RESOURCE PRIORITIES:")
        for resource, days in critical_resources.head(3).items():
            if resource:  # Skip empty strings
                print(f"   - {resource}: bottleneck for {days} days")


if __name__ == "__main__":
    main_enhanced_ml_pipeline()



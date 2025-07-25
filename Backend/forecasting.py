import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
import io
import base64
from typing import Dict, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.arima.model import ARIMA
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')

class DengueForecastingSystem:
    def __init__(self, data_path: str = None, df: pd.DataFrame = None):
        """Initialize with either file path or DataFrame"""
        self.df = self._load_data(data_path, df)
        self.prepare_data()
        self.models: Dict = {}
        self.forecasts: Dict = {}
        self.metrics: Dict = {}
        self.figures: Dict = {}

    def _load_data(self, data_path: str, df: pd.DataFrame) -> pd.DataFrame:
        """Load data from source"""
        if df is not None:
            return df.copy()
        elif data_path:
            return pd.read_csv(data_path)
        raise ValueError("Either data_path or df must be provided")

    def prepare_data(self) -> None:
        """Clean and feature engineer the dataset"""
        # Convert and sort dates
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df = self.df.sort_values('date').set_index('date')
        
        # Feature engineering
        self._create_lag_features()
        self._create_temporal_features()
        self._create_rolling_features()
        
        # Drop NA and validate
        self.df = self.df.dropna()
        if len(self.df) < 52:
            raise ValueError("Insufficient data (need at least 1 year of weekly data)")

    def _create_lag_features(self) -> None:
        """Create lagged features"""
        for lag in [1, 2, 3, 4]:
            self.df[f'cases_lag{lag}'] = self.df['reported_cases'].shift(lag)
            self.df[f'rainfall_lag{lag}'] = self.df['rainfall_mm'].shift(lag)

    def _create_temporal_features(self) -> None:
        """Extract temporal patterns"""
        self.df['month'] = self.df.index.month
        self.df['week_of_year'] = self.df.index.isocalendar().week
        self.df['is_monsoon'] = self.df.index.month.isin([6, 7, 8, 9]).astype(int)

    def _create_rolling_features(self) -> None:
        """Create rolling statistics"""
        for window in [4, 8, 12]:
            self.df[f'cases_ma_{window}'] = self.df['reported_cases'].rolling(window).mean()
            self.df[f'rainfall_ma_{window}'] = self.df['rainfall_mm'].rolling(window).mean()

    def train_test_split(self, test_size: float = 0.2) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Time-based split of data"""
        split_idx = int(len(self.df) * (1 - test_size))
        return self.df.iloc[:split_idx], self.df.iloc[split_idx:]

    def train_ensemble(self) -> Dict:
        """Train ensemble model with feature selection"""
        feature_cols = [
            'cases_lag1', 'cases_lag2', 'rainfall_lag2', 'rainfall_lag3',
            'month', 'is_monsoon', 'cases_ma_4', 'rainfall_ma_4'
        ]
        
        train, test = self.train_test_split()
        X_train, y_train = train[feature_cols], train['reported_cases']
        X_test = test[feature_cols]
        
        models = {
            'RandomForest': RandomForestRegressor(n_estimators=150, random_state=42),
            'GradientBoost': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'LinearReg': LinearRegression()
        }
        
        # Train and predict
        predictions = {}
        for name, model in models.items():
            model.fit(X_train, y_train)
            predictions[name] = model.predict(X_test)
        
        # Ensemble average
        ensemble_pred = np.mean(list(predictions.values()), axis=0)
        
        # Store results
        self.models['ensemble'] = models
        self.forecasts['ensemble'] = {
            'predictions': ensemble_pred,
            'actual': test['reported_cases'],
            'dates': test.index
        }
        
        return self._evaluate_models(test['reported_cases'], ensemble_pred)

    def _evaluate_models(self, actual: pd.Series, predicted: np.ndarray) -> Dict:
        """Calculate evaluation metrics"""
        metrics = {
            'mae': mean_absolute_error(actual, predicted),
            'rmse': np.sqrt(mean_squared_error(actual, predicted)),
            'r2': r2_score(actual, predicted),
            'mape': np.mean(np.abs((actual - predicted) / actual)) * 100
        }
        self.metrics['ensemble'] = metrics
        return metrics

    def forecast(self, weeks: int = 4) -> pd.DataFrame:
        """Generate future forecasts"""
        last_data = self.df.tail(8)  # Use last 8 weeks for feature generation
        
        forecasts = []
        for week in range(weeks):
            # Create feature vector for next week
            features = {
                'cases_lag1': last_data['reported_cases'].iloc[-1],
                'cases_lag2': last_data['reported_cases'].iloc[-2],
                'rainfall_lag2': last_data['rainfall_mm'].iloc[-2],
                'rainfall_lag3': last_data['rainfall_mm'].iloc[-3],
                'month': (last_data.index[-1] + timedelta(weeks=1)).month,
                'is_monsoon': int((last_data.index[-1] + timedelta(weeks=1)).month in [6,7,8,9]),
                'cases_ma_4': last_data['reported_cases'].tail(4).mean(),
                'rainfall_ma_4': last_data['rainfall_mm'].tail(4).mean()
            }
            
            # Ensemble prediction
            feature_array = np.array([[features[col] for col in [
                'cases_lag1', 'cases_lag2', 'rainfall_lag2', 'rainfall_lag3',
                'month', 'is_monsoon', 'cases_ma_4', 'rainfall_ma_4'
            ]]])
            
            preds = [model.predict(feature_array)[0] for model in self.models['ensemble'].values()]
            forecast_val = np.mean(preds)
            forecasts.append(forecast_val)
            
            # Update last_data for next iteration
            new_row = {
                'reported_cases': forecast_val,
                'rainfall_mm': last_data['rainfall_mm'].mean()  # Using average rainfall
            }
            last_data = pd.concat([
                    last_data,
                    pd.DataFrame([new_row], index=[last_data.index[-1] + timedelta(weeks=1)])
                ])

        # Create forecast DataFrame
        future_dates = pd.date_range(
            start=self.df.index[-1] + timedelta(weeks=1),
            periods=weeks,
            freq='W'
        )
        
        return pd.DataFrame({
            'date': future_dates,
            'cases_predicted': forecasts,
            'lower_ci': [f * 0.85 for f in forecasts],  # 15% lower bound
            'upper_ci': [f * 1.15 for f in forecasts]   # 15% upper bound
        })

    


    def get_forecast_plot(self, weeks: int = 12) -> str:
        """Generate and return base64-encoded forecast plot with confidence intervals"""
        plt.figure(figsize=(10, 6))


        # Plot forecast (ensemble)
        if 'ensemble' in self.forecasts:
            forecast_data = self.forecasts['ensemble']

            # Ensure forecast has datetime index or list
            forecast_dates = pd.to_datetime(forecast_data['dates'])
            forecast_values = forecast_data['predictions']

            

            # Plot predictions
            plt.plot(forecast_dates, forecast_values, 'r--', label='Forecast', linewidth=2)

            # Plot confidence intervals if available
            if 'lower_ci' in forecast_data and 'upper_ci' in forecast_data:
                plt.fill_between(
                    forecast_dates,
                    forecast_data['lower_ci'],
                    forecast_data['upper_ci'],
                    color='red',
                    alpha=0.2,
                    label='Confidence Interval'
                )

        plt.title('Dengue Case Forecast')
        plt.xlabel('Date')
        plt.ylabel('Reported Cases')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()

        # Encode image to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=120)
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')


    def run_pipeline(self) -> Dict:
        """Complete training and evaluation pipeline"""
        self.train_ensemble()
        forecast_df = self.forecast()
        
        return {
            'metrics': self.metrics['ensemble'],
            'forecast': forecast_df.to_dict(orient='records'),
            'plot': self.get_forecast_plot()
        }
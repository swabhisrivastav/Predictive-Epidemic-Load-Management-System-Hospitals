import pandas as pd
import numpy as np
from typing import Dict, Tuple, List
from datetime import timedelta
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import sqlite3
import joblib
import matplotlib.pyplot as plt
import io
import base64


class CovidForecastModel:
    def __init__(self):
        self.model = None
        self.fitted_model = None
        self.weekly_df = None
        self.best_params = None
        self.model_metrics = {}

    def aggregate_to_weekly(self, df: pd.DataFrame) -> pd.DataFrame:
        df['Date'] = pd.to_datetime(df['date'])  # Ensure lowercase 'date' from DB
        df.set_index('Date', inplace=True)
        weekly_df = df.resample('W-SUN')['hospitalized'].sum().reset_index()
        weekly_df.columns = ['Week', 'Weekly_Hospitalized']
        return weekly_df

    def find_best_arima_params(self, train_series: pd.Series) -> Tuple[int, int, int]:
        best_aic = float('inf')
        best_params = (1, 1, 1)  # Default fallback
        for p in range(0, 4):
            for d in range(0, 2):
                for q in range(0, 4):
                    try:
                        model = ARIMA(train_series, order=(p, d, q))
                        fitted_model = model.fit()
                        if fitted_model.aic < best_aic:
                            best_aic = fitted_model.aic
                            best_params = (p, d, q)
                    except:
                        continue
        return best_params

    def evaluate_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred) if np.var(y_true) > 0 else 0
        mape = np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1))) * 100
        accuracy = max(0, 100 - mape)
        return {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'mape': mape,
            'accuracy': accuracy
        }

    def run_pipeline(self, df: pd.DataFrame):
        self.weekly_df = self.aggregate_to_weekly(df)

        # Train/test split
        split_point = int(len(self.weekly_df) * 0.8)
        train_data = self.weekly_df[:split_point]
        test_data = self.weekly_df[split_point:]

        train_series = train_data.set_index('Week')['Weekly_Hospitalized']
        test_series = test_data.set_index('Week')['Weekly_Hospitalized']

        self.best_params = self.find_best_arima_params(train_series)
        full_series = self.weekly_df.set_index('Week')['Weekly_Hospitalized']
        self.model = ARIMA(full_series, order=self.best_params)
        self.fitted_model = self.model.fit()

        test_preds = self.fitted_model.forecast(steps=len(test_series))
        test_preds = np.maximum(test_preds, 0)
        self.model_metrics = self.evaluate_model(test_series.values, test_preds)

        # Optionally save the trained model
        #joblib.dump(self, "covid_forecaster.pkl")

    def get_forecast(self, steps: int = 4) -> Dict:
        if self.fitted_model is None or self.weekly_df is None:
            return {"error": "Model is not trained yet."}

        forecast_result = self.fitted_model.get_forecast(steps=steps)
        predictions = np.maximum(forecast_result.predicted_mean, 0)
        conf_int = np.maximum(forecast_result.conf_int(), 0)

        last_date = self.weekly_df['Week'].iloc[-1]

        forecast_data = []
        for i in range(steps):
            forecast_date = last_date + timedelta(weeks=i + 1)
            forecast_data.append({
                "date": forecast_date.strftime('%Y-%m-%d'),
                "predicted_cases": int(predictions[i]),
                "confidence_lower": float(conf_int.iloc[i, 0]),
                "confidence_upper": float(conf_int.iloc[i, 1])
            })

        return {
            "forecasts": forecast_data
        }
    
    def save_predictions_to_db(self, forecast_data: List[Dict], db_path: str = "db/covid_data.db"):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Optional: Clear old forecasts if needed
        cursor.execute("DELETE FROM forecast_covid")

        # Insert new forecast rows
        for entry in forecast_data:
            cursor.execute("""
                INSERT INTO forecast_covid (forecast_date, predicted_cases, lower_ci, upper_ci)
                VALUES (?, ?, ?, ?)
            """, (
                entry["date"],
                entry["predicted_cases"],
                entry["confidence_lower"],
                entry["confidence_upper"]
            ))

        conn.commit()
        conn.close()

    def get_covid_forecast_plot(self, weeks: int = 12) -> str:
        """Generate and return base64-encoded COVID-19 forecast plot with confidence intervals"""
        plt.figure(figsize=(10, 6))

        forecast_result = self.get_forecast(steps=weeks)
        forecast_data = forecast_result.get("forecasts", [])

        if not forecast_data:
            return ""

        forecast_dates = pd.to_datetime([item["date"] for item in forecast_data])
        forecast_values = [item["predicted_cases"] for item in forecast_data]

        # Plot predicted cases
        plt.plot(forecast_dates, forecast_values, 'r--', label='Forecast', linewidth=2)


        plt.title('COVID-19 Case Forecast')
        plt.xlabel('Date')
        plt.ylabel('Predicted Cases')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=120)
        plt.close()
        buf.seek(0)

        return base64.b64encode(buf.read()).decode('utf-8')




# Uncomment to run and test locally
# if __name__ == "__main__":
#     conn = sqlite3.connect("db/covid_data.db")
#     df = pd.read_sql("SELECT date, hospitalized FROM bangalore_cases", conn)
#     conn.close()

#     model = CovidForecastModel()
#     model.run_pipeline(df)
#     forecasts = model.get_forecast()

#     print("Forecasts:")
#     for forecast in forecasts["forecasts"]:
#         print(forecast)

#     print("\nModel Metrics:")
#     print(model.model_metrics)

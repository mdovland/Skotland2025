import React from 'react';
import { tripInfo } from '../data/initialData';
import './TripInfo.css';

const TripInfo: React.FC = () => {
  return (
    <div className="trip-info">
      <h2>Scotland Golf Trip 2025</h2>
      <p className="trip-dates">24-28 September 2025</p>

      <div className="info-section">
        <h3>✈️ Flights</h3>
        <div className="flights">
          {tripInfo.flights.map((flight, index) => (
            <div key={index} className="flight-card">
              <div className="flight-header">
                {flight.direction === 'outbound' ? 'Outbound' : 'Return'} - {new Date(flight.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="flight-route">
                <div className="airport">
                  <div className="city">{flight.from}</div>
                  <div className="code">{flight.fromCode}</div>
                  <div className="time">{flight.departureTime}</div>
                </div>
                <div className="flight-details">
                  <div className="duration">Direct</div>
                  <div className="line">→</div>
                  <div className="duration">{flight.duration}</div>
                </div>
                <div className="airport">
                  <div className="city">{flight.to}</div>
                  <div className="code">{flight.toCode}</div>
                  <div className="time">{flight.arrivalTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3>🏨 Accommodation</h3>
        <div className="hotel-card">
          <div className="hotel-name">{tripInfo.hotel.name}</div>
          <div className="hotel-address">{tripInfo.hotel.address}</div>
          <div className="hotel-phone">📞 {tripInfo.hotel.phone}</div>
        </div>
      </div>

      <div className="info-section">
        <h3>⛳ Golf Schedule</h3>
        <div className="courses">
          {tripInfo.courses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-date">
                {new Date(course.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="course-name">{course.name}</div>
              <div className="course-time">
                🕐 {course.startTime} - {course.endTime}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripInfo;
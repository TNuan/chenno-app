import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
    FiChevronLeft, 
    FiChevronRight, 
    FiCalendar,
    FiClock,
    FiUser,
    FiTag
} from 'react-icons/fi';
import { getUserCards } from '../../services/api';
import CardDetail from '../Card/CardDetail';
import './CalendarView.css'; // Custom CSS

// Setup moment localizer
moment.locale('vi');
const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
    const [currentView, setCurrentView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchUserCards = async () => {
        try {
            setLoading(true);
            const response = await getUserCards();
            setAllCards(response.cards || []);
        } catch (error) {
            console.error('Error fetching user cards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserCards();
    }, []);

    // Transform cards to calendar events
    const events = useMemo(() => {
        return allCards.map(card => {
            const startDate = new Date(card.created_at);
            const endDate = card.due_date ? new Date(card.due_date) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
            
            return {
                id: card.id,
                title: card.title,
                start: startDate,
                end: endDate,
                resource: card,
                allDay: !card.due_date || (endDate.getHours() === 0 && endDate.getMinutes() === 0)
            };
        });
    }, [allCards]);

    const handleSelectEvent = (event) => {
        setSelectedCard(event.resource);
        setIsCardDetailOpen(true);
    };

    const handleUpdateCard = (updatedCard) => {
        setAllCards(prevCards => 
            prevCards.map(card => 
                card.id === updatedCard.id ? { ...card, ...updatedCard } : card
            )
        );
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 3: return '#ef4444'; // red-500
            case 2: return '#f59e0b'; // yellow-500
            case 1: return '#10b981'; // green-500
            default: return '#6b7280'; // gray-500
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'done': return '#10b981'; // green-500
            case 'in_progress': return '#3b82f6'; // blue-500
            case 'review': return '#8b5cf6'; // purple-500
            case 'blocked': return '#ef4444'; // red-500
            default: return '#6b7280'; // gray-500
        }
    };

    // Custom event component - Simplified
    const EventComponent = ({ event }) => {
        const card = event.resource;
        return (
            <div className="calendar-event-simple">
                <div 
                    className="event-priority-dot"
                    style={{ backgroundColor: getPriorityColor(card.priority_level) }}
                ></div>
                <span className="event-title-simple">{event.title}</span>
            </div>
        );
    };

    // Custom agenda event component
    const AgendaEventComponent = ({ event }) => {
        const card = event.resource;
        return (
            <div className="agenda-event">
                <div className="agenda-event-content">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getStatusColor(card.status) }}
                        ></div>
                        <span className="font-medium">{event.title}</span>
                        <div 
                            className="w-2 h-2 rounded-full ml-auto"
                            style={{ backgroundColor: getPriorityColor(card.priority_level) }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {card.board_name} • {card.column_name}
                    </div>
                    {card.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {card.description}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Custom toolbar
    const CustomToolbar = ({ label, onNavigate, onView, view }) => {
        return (
            <div className="calendar-toolbar">
                <div className="toolbar-navigation">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="nav-button"
                    >
                        <FiChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onNavigate('TODAY')}
                        className="today-button"
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="nav-button"
                    >
                        <FiChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="toolbar-label">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {label}
                    </h2>
                </div>

                <div className="toolbar-views">
                    {['month', 'week', 'day', 'agenda'].map(viewName => (
                        <button
                            key={viewName}
                            onClick={() => onView(viewName)}
                            className={`view-button ${view === viewName ? 'active' : ''}`}
                        >
                            {viewName === 'month' && 'Tháng'}
                            {viewName === 'week' && 'Tuần'}
                            {viewName === 'day' && 'Ngày'}
                            {viewName === 'agenda' && 'Lịch trình'}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const eventStyleGetter = (event) => {
        const card = event.resource;
        return {
            style: {
                backgroundColor: getStatusColor(card.status),
                border: 'none',
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            {/* Header */}
            <div className="calendar-header">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Calendar
                    </h1>
                    <div className="calendar-stats">
                        <span className="stat-item">
                            <FiCalendar className="w-4 h-4" />
                            {allCards.length} Tasks
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="calendar-legend">
                    <div className="legend-section">
                        <span className="legend-title">Trạng thái:</span>
                        <div className="legend-items">
                            <div className="legend-item">
                                <div className="legend-color bg-green-500"></div>
                                <span>Hoàn thành</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color bg-blue-500"></div>
                                <span>Đang thực hiện</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color bg-purple-500"></div>
                                <span>Đang review</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color bg-red-500"></div>
                                <span>Bị block</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color bg-gray-500"></div>
                                <span>Todo</span>
                            </div>
                        </div>
                    </div>
                    <div className="legend-section">
                        <span className="legend-title">Độ ưu tiên:</span>
                        <div className="legend-items">
                            <div className="legend-item">
                                <div className="legend-priority high"></div>
                                <span>Cao</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-priority medium"></div>
                                <span>Trung bình</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-priority low"></div>
                                <span>Thấp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="calendar-content">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 900 }} // Tăng chiều cao
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar,
                        event: EventComponent,
                        agenda: {
                            event: AgendaEventComponent
                        }
                    }}
                    views={['month', 'week', 'day', 'agenda']}
                    defaultView="month"
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}

                    messages={{
                        next: "Tiếp",
                        previous: "Trước",
                        today: "Hôm nay",
                        month: "Tháng",
                        week: "Tuần", 
                        day: "Ngày",
                        agenda: "Lịch trình",
                        date: "Ngày",
                        time: "Thời gian",
                        event: "Sự kiện",
                        noEventsInRange: "Không có task nào trong khoảng thời gian này.",
                        showMore: total => `+ Xem thêm ${total} task`
                    }}
                    formats={{
                        monthHeaderFormat: 'MMMM YYYY',
                        dayHeaderFormat: 'dddd, DD MMMM YYYY',
                        dayRangeHeaderFormat: ({ start, end }) => 
                            `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`,
                        agendaHeaderFormat: ({ start, end }) =>
                            `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`,
                        agendaDateFormat: 'dddd DD/MM',
                        agendaTimeFormat: 'HH:mm',
                        agendaTimeRangeFormat: ({ start, end }) =>
                            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                    }}
                />
            </div>

            {/* Card Detail Modal */}
            {selectedCard && (
                <CardDetail
                    card={selectedCard}
                    isOpen={isCardDetailOpen}
                    onClose={() => {
                        setIsCardDetailOpen(false);
                        setSelectedCard(null);
                    }}
                    onUpdate={handleUpdateCard}
                    canModify={true}
                />
            )}
        </div>
    );
};

export default CalendarView;
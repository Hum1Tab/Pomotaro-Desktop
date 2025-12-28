interface SessionInfoProps {
    sessionsCompleted: number;
}

export function SessionInfo({ sessionsCompleted }: SessionInfoProps) {
    return (
        <div className="text-center space-y-1">
            <div className="text-sm text-muted-foreground">Sessions Completed</div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{sessionsCompleted}</div>
        </div>
    );
}

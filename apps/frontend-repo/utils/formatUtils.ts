
export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
};

export const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never active';

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If less than 24 hours ago, show relative time
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            if (diffMinutes === 0) {
                return 'Just now';
            }
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }

    // If less than 7 days ago, show days ago
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    // Otherwise show the full date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const getActivityColor = (timestamp: number | undefined): "success" | "warning" | "error" | "default" => {
    if (!timestamp) return "default";

    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "success";
    if (diffDays < 7) return "warning";
    return "error";
};

export const getIconColor = (timestamp: number | undefined): "success" | "warning" | "error" | "action" => {
    if (!timestamp) return "action";

    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "success";
    if (diffDays < 7) return "warning";
    return "error";
}; 
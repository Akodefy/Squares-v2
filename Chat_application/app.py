from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tamil_chat_app_secret_key_2024'

# Language translations
TRANSLATIONS = {
    'en': {
        'app_title': 'Tamil Chat Application',
        'login': 'Login',
        'register': 'Register',
        'email': 'Email Address',
        'password': 'Password',
        'username': 'Username',
        'display_name': 'Display Name',
        'login_btn': 'Login',
        'register_btn': 'Register',
        'dont_have_account': "Don't have an account?",
        'register_here': 'Register here',
        'already_have_account': 'Already have an account?',
        'login_here': 'Login here',
        'sample_accounts': 'Sample User Accounts',
        'invalid_credentials': 'Invalid email or password',
        'email_exists': 'Email already registered',
        'registration_successful': 'Registration successful! Please login.',
        'welcome': 'Welcome',
        'chat_with': 'Chatting with',
        'logout': 'Logout',
        'send': 'Send',
        'no_messages': 'No messages yet. Start the conversation!',
        'delete': 'Delete',
        'users': 'Users',
        'online': 'Online',
        'language': 'Language',
        'emojis': 'Emojis',
        'stickers': 'Stickers',
        'type_message_emoji': 'Type your message with emojis and stickers...',
        'notifications': 'Notifications',
        'notification_permission': 'Enable desktop notifications?',
        'activity_status': 'Activity Status',
        'last_seen': 'Last seen',
        'typing': 'is typing...',
        'new_message': 'New message from',
        'unread_messages': 'unread messages',
        'mark_read': 'Mark as read',
        'sound_notifications': 'Sound Notifications'
    },
    'ta': {
        'app_title': 'தமிழ் அரட்டை பயன்பாடு',
        'login': 'உள்நுழைவு',
        'register': 'பதிவு',
        'email': 'மின்னஞ்சல் முகவரி',
        'password': 'கடவுச்சொல்',
        'username': 'பயனர்பெயர்',
        'display_name': 'காட்சிப்பெயர்',
        'login_btn': 'உள்நுழைய',
        'register_btn': 'பதிவு செய்யுங்கள்',
        'dont_have_account': 'கணக்கு இல்லையா?',
        'register_here': 'பதிவு செய்யுங்கள்',
        'already_have_account': 'ஏற்கனவே கணக்கு உள்ளதா?',
        'login_here': 'உள்நுழையவும்',
        'sample_accounts': 'மாதிரி பயனர் கணக்குகள்',
        'invalid_credentials': 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்',
        'email_exists': 'மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',
        'registration_successful': 'பதிவு வெற்றிகரமானது! தயவுசெய்து உள்நுழையவும்.',
        'welcome': 'வரவேற்கிறோம்',
        'chat_with': 'அரட்டை',
        'logout': 'வெளியேறு',
        'send': 'அனுப்பு',
        'no_messages': 'இன்னும் செய்திகள் இல்லை. உரையாடலைத் தொடங்குங்கள்!',
        'delete': 'அழி',
        'users': 'பயனர்கள்',
        'online': 'இணைப்பில்',
        'language': 'மொழி',
        'emojis': 'வெளிப்பாடுகள்',
        'stickers': 'ஸ்டிக்கர்கள்',
        'type_message_emoji': 'வெளிப்பாடுகள் மற்றும் ஸ்டிக்கர்களுடன் உங்கள் செய்தியைத் தட்டச்சு செய்யுங்கள்...',
        'notifications': 'அறிவிப்புகள்',
        'notification_permission': 'டெஸ்க்டாப் அறிவிப்புகளை இயக்கவா?',
        'activity_status': 'செயல்பாட்டு நிலை',
        'last_seen': 'கடைசியாக பார்க்கப்பட்டது',
        'typing': 'தட்டச்சு செய்கிறார்...',
        'new_message': 'புதிய செய்தி',
        'unread_messages': 'படிக்காத செய்திகள்',
        'mark_read': 'படித்ததாக குறிக்கவும்',
        'sound_notifications': 'ஒலி அறிவிப்புகள்'
    }
}

def get_language():
    """Get current language from session or default to English"""
    return session.get('language', 'en')

def get_text(key):
    """Get translated text for the current language"""
    lang = get_language()
    return TRANSLATIONS.get(lang, {}).get(key, TRANSLATIONS['en'].get(key, key))

@app.context_processor
def inject_language():
    """Make language functions available in templates"""
    return dict(get_text=get_text, current_language=get_language())

# Database setup
def init_db():
    conn = sqlite3.connect('chat_app.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT NOT NULL,
            is_online INTEGER DEFAULT 0,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add new columns to existing users table if they don't exist
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0')
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e):
            print(f"Error adding is_online column: {e}")
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e):
            print(f"Error adding last_seen column: {e}")
    
    # Messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_email TEXT NOT NULL,
            receiver_email TEXT NOT NULL,
            message_text TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_email) REFERENCES users (email),
            FOREIGN KEY (receiver_email) REFERENCES users (email)
        )
    ''')
    
    # Add is_read column to existing messages table if it doesn't exist
    try:
        cursor.execute('ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0')
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e):
            print(f"Error adding is_read column: {e}")
    
    # Notification preferences table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notification_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            desktop_notifications INTEGER DEFAULT 1,
            sound_notifications INTEGER DEFAULT 1,
            typing_notifications INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users (email)
        )
    ''')
    
    # Activity tracking table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            target_user_email TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users (email)
        )
    ''')
    
    # Insert sample users
    sample_users = [
        ('arun@gmail.com', 'arun123', 'Arun'),
        ('kavi@gmail.com', 'kavi123', 'Kavitha'),
        ('mani@gmail.com', 'mani123', 'Mani')
    ]
    
    for email, password, display_name in sample_users:
        cursor.execute('SELECT email FROM users WHERE email = ?', (email,))
        if not cursor.fetchone():
            password_hash = generate_password_hash(password)
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, display_name) 
                VALUES (?, ?, ?, ?)
            ''', (display_name, email, password_hash, display_name))
    
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('chat_app.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/set_language/<language>')
def set_language(language):
    """Set the application language"""
    if language in ['en', 'ta']:
        session['language'] = language
    return redirect(request.referrer or url_for('index'))

@app.route('/')
def index():
    if 'user_email' in session:
        return redirect(url_for('chat'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_email'] = user['email']
            session['user_name'] = user['display_name']
            
            # Set user as online
            conn = get_db_connection()
            conn.execute('''
                UPDATE users 
                SET is_online = 1, last_seen = CURRENT_TIMESTAMP 
                WHERE email = ?
            ''', (user['email'],))
            conn.commit()
            conn.close()
            
            return redirect(url_for('chat'))
        else:
            flash(get_text('invalid_credentials'), 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        display_name = request.form['display_name']
        
        conn = get_db_connection()
        
        # Check if user exists
        existing_user = conn.execute('SELECT email FROM users WHERE email = ?', (email,)).fetchone()
        if existing_user:
            flash(get_text('email_exists'), 'error')
            conn.close()
            return render_template('register.html')
        
        # Create new user
        password_hash = generate_password_hash(password)
        conn.execute('''
            INSERT INTO users (username, email, password_hash, display_name) 
            VALUES (?, ?, ?, ?)
        ''', (username, email, password_hash, display_name))
        conn.commit()
        conn.close()
        
        flash(get_text('registration_successful'), 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/chat')
def chat():
    if 'user_email' not in session:
        return redirect(url_for('login'))
    
    # Get all users except current user with online status and unread counts
    conn = get_db_connection()
    users = conn.execute('''
        SELECT u.email, u.display_name, u.is_online, u.last_seen,
               COALESCE(m.unread_count, 0) as unread_count
        FROM users u
        LEFT JOIN (
            SELECT sender_email, COUNT(*) as unread_count
            FROM messages 
            WHERE receiver_email = ? AND is_read = 0
            GROUP BY sender_email
        ) m ON u.email = m.sender_email
        WHERE u.email != ? 
        ORDER BY u.is_online DESC, u.display_name
    ''', (session['user_email'], session['user_email'])).fetchall()
    conn.close()
    
    return render_template('chat.html', users=users, current_user=session['user_name'])

@app.route('/get_messages/<receiver_email>')
def get_messages(receiver_email):
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    messages = conn.execute('''
        SELECT m.*, u1.display_name as sender_name, u2.display_name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_email = u1.email
        JOIN users u2 ON m.receiver_email = u2.email
        WHERE (m.sender_email = ? AND m.receiver_email = ?) 
           OR (m.sender_email = ? AND m.receiver_email = ?)
        ORDER BY m.timestamp ASC
    ''', (session['user_email'], receiver_email, receiver_email, session['user_email'])).fetchall()
    conn.close()
    
    messages_list = []
    for msg in messages:
        messages_list.append({
            'id': msg['id'],
            'sender_email': msg['sender_email'],
            'receiver_email': msg['receiver_email'],
            'sender_name': msg['sender_name'],
            'receiver_name': msg['receiver_name'],
            'message_text': msg['message_text'],
            'timestamp': msg['timestamp']
        })
    
    return jsonify(messages_list)

@app.route('/delete_message/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    # Only allow users to delete their own messages
    result = conn.execute('''
        DELETE FROM messages 
        WHERE id = ? AND sender_email = ?
    ''', (message_id, session['user_email']))
    
    if result.rowcount > 0:
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    else:
        conn.close()
        return jsonify({'error': 'Message not found or unauthorized'}), 404

@app.route('/mark_messages_read', methods=['POST'])
def mark_messages_read():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    sender_email = data.get('sender_email')
    
    if not sender_email:
        return jsonify({'error': 'Sender email required'}), 400
    
    conn = get_db_connection()
    conn.execute('''
        UPDATE messages 
        SET is_read = 1 
        WHERE receiver_email = ? AND sender_email = ? AND is_read = 0
    ''', (session['user_email'], sender_email))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/update_activity', methods=['POST'])
def update_activity():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json() or {}
    activity_type = data.get('activity', 'online')  # 'online', 'typing', 'idle'
    
    conn = get_db_connection()
    
    if activity_type == 'typing':
        # Update typing status without affecting is_online
        conn.execute('''
            UPDATE users 
            SET last_seen = CURRENT_TIMESTAMP 
            WHERE email = ?
        ''', (session['user_email'],))
    else:
        # Update online status and last seen
        is_online = 1 if activity_type == 'online' else 0
        conn.execute('''
            UPDATE users 
            SET is_online = ?, last_seen = CURRENT_TIMESTAMP 
            WHERE email = ?
        ''', (is_online, session['user_email']))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/get_unread_count')
def get_unread_count():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    result = conn.execute('''
        SELECT COUNT(*) as unread_count 
        FROM messages 
        WHERE receiver_email = ? AND is_read = 0
    ''', (session['user_email'],)).fetchone()
    conn.close()
    
    return jsonify({'unread_count': result['unread_count']})

@app.route('/set_notification_preferences', methods=['POST'])
def set_notification_preferences():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    desktop_notifications = data.get('desktop_notifications', 1)
    sound_notifications = data.get('sound_notifications', 1)
    typing_notifications = data.get('typing_notifications', 1)
    
    conn = get_db_connection()
    
    # Check if preferences exist
    existing = conn.execute('''
        SELECT id FROM notification_preferences WHERE user_email = ?
    ''', (session['user_email'],)).fetchone()
    
    if existing:
        conn.execute('''
            UPDATE notification_preferences 
            SET desktop_notifications = ?, sound_notifications = ?, typing_notifications = ?
            WHERE user_email = ?
        ''', (desktop_notifications, sound_notifications, typing_notifications, session['user_email']))
    else:
        conn.execute('''
            INSERT INTO notification_preferences 
            (user_email, desktop_notifications, sound_notifications, typing_notifications)
            VALUES (?, ?, ?, ?)
        ''', (session['user_email'], desktop_notifications, sound_notifications, typing_notifications))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/get_notification_preferences')
def get_notification_preferences():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    prefs = conn.execute('''
        SELECT * FROM notification_preferences WHERE user_email = ?
    ''', (session['user_email'],)).fetchone()
    conn.close()
    
    if prefs:
        return jsonify({
            'desktop_notifications': prefs['desktop_notifications'],
            'sound_notifications': prefs['sound_notifications'],
            'typing_notifications': prefs['typing_notifications']
        })
    else:
        # Return default preferences
        return jsonify({
            'desktop_notifications': 1,
            'sound_notifications': 1,
            'typing_notifications': 1
        })

@app.route('/set_typing_status', methods=['POST'])
def set_typing_status():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    target_user_email = data.get('target_user_email')
    is_typing = data.get('is_typing', False)
    
    conn = get_db_connection()
    
    if is_typing:
        # Add typing activity
        conn.execute('''
            INSERT OR REPLACE INTO user_activity 
            (user_email, activity_type, target_user_email)
            VALUES (?, 'typing', ?)
        ''', (session['user_email'], target_user_email))
    else:
        # Remove typing activity
        conn.execute('''
            DELETE FROM user_activity 
            WHERE user_email = ? AND activity_type = 'typing' AND target_user_email = ?
        ''', (session['user_email'], target_user_email))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/get_typing_status/<target_user_email>')
def get_typing_status(target_user_email):
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    
    # Get users typing to current user
    typing_users = conn.execute('''
        SELECT u.display_name, ua.timestamp
        FROM user_activity ua
        JOIN users u ON ua.user_email = u.email
        WHERE ua.activity_type = 'typing' 
        AND ua.target_user_email = ?
        AND ua.timestamp > datetime('now', '-10 seconds')
    ''', (session['user_email'],)).fetchall()
    
    conn.close()
    
    return jsonify({
        'typing_users': [{'name': user['display_name'], 'timestamp': user['timestamp']} 
                        for user in typing_users]
    })

@app.route('/logout')
def logout():
    if 'user_email' in session:
        # Set user as offline
        conn = get_db_connection()
        conn.execute('''
            UPDATE users 
            SET is_online = 0, last_seen = CURRENT_TIMESTAMP 
            WHERE email = ?
        ''', (session['user_email'],))
        conn.commit()
        conn.close()
    
    session.clear()
    return redirect(url_for('login'))

# Send message route
@app.route('/send_message', methods=['POST'])
def send_message():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    sender_email = session['user_email']
    receiver_email = data['receiver_email']
    message_text = data['message']
    
    # Save message to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (sender_email, receiver_email, message_text) 
        VALUES (?, ?, ?)
    ''', (sender_email, receiver_email, message_text))
    message_id = cursor.lastrowid
    
    # Get sender name
    sender = conn.execute('SELECT display_name FROM users WHERE email = ?', (sender_email,)).fetchone()
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': {
            'id': message_id,
            'sender_email': sender_email,
            'sender_name': sender['display_name'],
            'message_text': message_text,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    })

@app.route('/get_users_status')
def get_users_status():
    if 'user_email' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    users = conn.execute('''
        SELECT u.email, u.display_name, u.is_online, u.last_seen,
               COALESCE(m.unread_count, 0) as unread_count
        FROM users u
        LEFT JOIN (
            SELECT sender_email, COUNT(*) as unread_count
            FROM messages 
            WHERE receiver_email = ? AND is_read = 0
            GROUP BY sender_email
        ) m ON u.email = m.sender_email
        WHERE u.email != ? 
        ORDER BY u.is_online DESC, u.display_name
    ''', (session['user_email'], session['user_email'])).fetchall()
    conn.close()
    
    users_list = []
    for user in users:
        users_list.append({
            'email': user['email'],
            'display_name': user['display_name'],
            'is_online': user['is_online'],
            'last_seen': user['last_seen'],
            'unread_count': user['unread_count']
        })
    
    return jsonify({'users': users_list})

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Tamil Chat Application Starting...")
    print("தமிழ் அரட்டை பயன்பாட்டைத் தொடங்குகிறது...")
    print("="*60)
    
    init_db()
    
    print("\n✅ Database initialized successfully!")
    print("✅ தரவுத்தள தொடக்கம் வெற்றிகரமானது!")
    
    print(f"\n🌐 Server starting on: http://localhost:5000")
    print(f"🌐 சர்வர் இந்த முகவரியில் இயங்குகிறது: http://localhost:5000")
    print(f"🌐 External access: http://0.0.0.0:5000")
    
    print("\n👤 Sample User Accounts / மாதிரி பயனர் கணக்குகள்:")
    print("   📧 arun@gmail.com / 🔑 arun123 (Arun)")
    print("   📧 kavi@gmail.com / 🔑 kavi123 (Kavitha)")
    print("   📧 mani@gmail.com / 🔑 mani123 (Mani)")
    
    print("\n🔔 New Features Added:")
    print("   ✅ Desktop Notifications")
    print("   ✅ Sound Notifications") 
    print("   ✅ Activity Status Tracking")
    print("   ✅ Typing Indicators")
    print("   ✅ Real-time User Status")
    print("   ✅ Notification Preferences")
    
    print(f"\n⚡ Press Ctrl+C to stop the server")
    print(f"⚡ சர்வரை நிறுத்த Ctrl+C ஐ அழுத்தவும்")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
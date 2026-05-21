import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonText,
  IonButton,
  IonSpinner,
} from '@ionic/react';
import { searchOutline, personOutline, chevronForwardOutline } from 'ionicons/icons';
import userService, { PublicUser } from '../services/userService';
import './UserSearch.css';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers(query.trim());
      } else {
        setResults([]);
        setError('');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const searchUsers = async (value: string) => {
    setLoading(true);
    setError('');

    try {
      const users = await userService.searchUsers(value);
      setResults(users);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao pesquisar utilizadores');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openProfile = (userId: string) => {
    history.push(`/profile/${userId}`);
  };

  return (
    <IonPage>
      <IonHeader className="user-search-header">
        <IonToolbar>
          <IonTitle>Procurar utilizadores</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="user-search-content" fullscreen>
        <div className="user-search-top">
          <IonIcon icon={searchOutline} className="user-search-icon" />
          <IonSearchbar
            value={query}
            onIonInput={(e) => setQuery(e.detail.value || '')}
            placeholder="Digite pelo menos 2 caracteres"
            debounce={300}
          />
        </div>

        {loading && (
          <div className="user-search-loading">
            <IonSpinner name="crescent" />
            <span>Buscando utilizadores...</span>
          </div>
        )}

        {!loading && error && (
          <div className="user-search-empty">
            <IonText color="danger">{error}</IonText>
          </div>
        )}

        {!loading && !query.trim() && (
          <div className="user-search-empty">
            <IonText>Comece a digitar um nome para encontrar utilizadores.</IonText>
          </div>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
          <div className="user-search-empty">
            <IonText>Nenhum utilizador encontrado.</IonText>
          </div>
        )}

        <IonList>
          {results.map((user) => (
            <IonItem key={user.id} button onClick={() => openProfile(user.id)}>
              <IonAvatar slot="start" className="user-search-avatar">
                {user.avatar ? (
                  user.avatar.startsWith('data:') ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.avatar}</span>
                  )
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </IonAvatar>
              <IonLabel>
                <h2>{user.name}</h2>
                <p>{user.email || 'Email privado'}</p>
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" />
            </IonItem>
          ))}
        </IonList>

        <div className="user-search-footer">
          <IonButton fill="clear" onClick={() => setQuery('')}>
            Limpar pesquisa
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserSearch;

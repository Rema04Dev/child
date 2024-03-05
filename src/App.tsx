import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup, ListGroup } from "react-bootstrap";

type User = {
  id: string;
  name: string;
  email: string;
  role: "developer" | "manager" | "designer";
};

const people: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    role: "developer",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    role: "manager",
  },
  {
    id: "3",
    name: "Sam Smith",
    email: "samsmith@gmail.com",
    role: "designer",
  },
];
function App() {
  const [users, setUsers] = useState<User[]>(people);
  const [filter, setFilter] = useState<User["role"] | "all">("all");
  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role === filter
  );

  useEffect(() => {
    console.log("Child App Loaded");
    const handleMessageFromParent = (event: MessageEvent) => {
      // Проверка источника сообщения, чтобы избежать обработки сообщений от нежелательных источников
      if (event.origin !== 'http://localhost:5173') {
        return;
      }

      // Выводим сообщение, полученное от родительского окна
      console.log('Received message from parent:', event.data);
      setFilter(event.data);
    };

    // Добавление слушателя события message
    window.addEventListener('message', handleMessageFromParent);

    // Отписываемся от события при размонтировании компонента
    return () => {
      window.removeEventListener('message', handleMessageFromParent);
    };
  }, []);

  const sendMessageToParent = (message: User["role"] | "all") => {
    // Отправляем сообщение родительскому окну
    window.parent.postMessage(message, "http://localhost:5173");
    setFilter(message);
  };

  return (
    <div className="App">
      <h1>Child App</h1>
      <ButtonGroup>
        <Button
          onClick={() => sendMessageToParent("all")}
          variant="outline-primary"
          active={filter === "all"}
        >
          all
        </Button>
        <Button
          onClick={() => sendMessageToParent("developer")}
          variant="outline-primary"
          active={filter === "developer"}
        >
          developers
        </Button>
        <Button
          onClick={() => sendMessageToParent("manager")}
          variant="outline-primary"
          active={filter === "manager"}
        >
          managers
        </Button>
        <Button
          onClick={() => sendMessageToParent("designer")}
          variant="outline-primary"
          active={filter === "designer"}
          >
          designers
          </Button>
      </ButtonGroup>
      <ListGroup>
        {filteredUsers.map((user) => (
          <ListGroup.Item key={user.id}>
            {user.name} - {user.email} - {user.role}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default App;

import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

interface AuthValidationProps {
  data: {
    activationToken: string;
    message: string;
    success: boolean;
  };
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthValidation = ({ data, setIsLogin }: AuthValidationProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState({
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
  });
  useEffect(() => {
    onOpen();
  }, []);

  const handleValidation = async () => {
    setLoading(true);
    try {
      await api.post("/activation", {
        activation_token: data.activationToken,
        activation_code: otp.otp1 + otp.otp2 + otp.otp3 + otp.otp4,
      });
      onClose();
      toast({
        title: "Success",
        description: "Your account has been activated successfully",
        status: "success",
        variant: "top-accent",
        duration: 5000,
        isClosable: true,
      });
      setIsLogin(true);
    } catch (error: any) {
      if (error.response.data.message === "jwt expired") {
        toast({
          title: "Error",
          description: "Link Expired Please try again",
          status: "error",
          variant: "top-accent",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid Code please try again",
          status: "error",
          variant: "top-accent",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <Modal
      closeOnOverlayClick={false}
      size="lg"
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Verify Your Account</ModalHeader>
        <ModalCloseButton onClick={() => navigate(0)} />
        <ModalBody sx={{ display: "flex", justifyContent: "center" }}>
          <HStack>
            <PinInput otp>
              <PinInputField
                value={otp.otp1}
                onChange={(e) => setOtp({ ...otp, otp1: e.target.value })}
              />
              <PinInputField
                value={otp.otp2}
                onChange={(e) => setOtp({ ...otp, otp2: e.target.value })}
              />
              <PinInputField
                value={otp.otp3}
                onChange={(e) => setOtp({ ...otp, otp3: e.target.value })}
              />
              <PinInputField
                value={otp.otp4}
                onChange={(e) => setOtp({ ...otp, otp4: e.target.value })}
              />
            </PinInput>
          </HStack>
        </ModalBody>
        <ModalFooter sx={{ display: "flex", justifyContent: "center", gap: 5 }}>
          <Button variant="ghost" onClick={() => navigate(0)}>
            Close
          </Button>
          <Button
            isLoading={loading}
            variant="solid"
            onClick={handleValidation}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthValidation;

import { Cooperative } from '@/types';
import api from '@/utils/api';

export const cooperativeService = {
  async getCooperatives() {
    return api.getCooperatives();
  },

  async getCooperative(id: number) {
    return api.getCooperative(id);
  },

  async updateCooperative(id: number, data: Partial<Cooperative>) {
    return api.updateCooperative(id, data);
  }
};
